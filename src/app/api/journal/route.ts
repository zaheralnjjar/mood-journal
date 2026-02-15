import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '../auth/route';

// دالة للحصول على userId من الطلب
async function getUserId(request: NextRequest): Promise<string | null> {
  // من Cookie
  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) return decoded.userId;
  }

  // من Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (decoded) return decoded.userId;
  }

  return null;
}

// GET - جلب جميع اليوميات
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const journals = await db.journalEntry.findMany({
      where: { userId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId },
        },
      },
      orderBy: { date: 'desc' },
    });

    const formattedJournals = journals.map((journal) => ({
      id: journal.id,
      title: journal.title,
      content: journal.content,
      mood: journal.mood,
      tags: journal.tags.map((t) => t.tag.name),
      date: journal.date.toISOString().split('T')[0],
      location: journal.location,
      weather: journal.weather,
      attachments: journal.attachments,
      templateId: journal.templateId,
      smartForms: journal.smartForms,
      isFavorite: journal.favorites.length > 0,
      createdAt: journal.createdAt.toISOString(),
      updatedAt: journal.updatedAt.toISOString(),
    }));

    return NextResponse.json({ journals: formattedJournals });
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}

// POST - إنشاء يومية جديدة
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, tags, date, location, weather, templateId, smartForms } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'العنوان والتاريخ مطلوبان' },
        { status: 400 }
      );
    }

    const journal = await db.journalEntry.create({
      data: {
        userId,
        title,
        content: content || [],
        mood,
        date: new Date(date),
        location,
        weather,
        templateId,
        smartForms,
      },
    });

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await db.tag.findFirst({
          where: { userId, name: tagName },
        });

        if (!tag) {
          tag = await db.tag.create({
            data: {
              userId,
              name: tagName,
              color: '#8b5cf6',
            },
          });
        }

        await db.journalTag.create({
          data: {
            journalId: journal.id,
            tagId: tag.id,
          },
        });
      }
    }

    return NextResponse.json({
      journal: {
        id: journal.id,
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
        tags: tags || [],
        date: journal.date.toISOString().split('T')[0],
        createdAt: journal.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json(
      { error: 'Failed to create journal' },
      { status: 500 }
    );
  }
}

// PUT - تحديث يومية
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, mood, tags, date, location, weather, templateId, smartForms } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف اليومية مطلوب' }, { status: 400 });
    }

    const journal = await db.journalEntry.update({
      where: { id, userId },
      data: {
        title,
        content,
        mood,
        date: date ? new Date(date) : undefined,
        location,
        weather,
        templateId,
        smartForms,
      },
    });

    if (tags) {
      await db.journalTag.deleteMany({
        where: { journalId: id },
      });

      for (const tagName of tags) {
        let tag = await db.tag.findFirst({
          where: { userId, name: tagName },
        });

        if (!tag) {
          tag = await db.tag.create({
            data: { userId, name: tagName, color: '#8b5cf6' },
          });
        }

        await db.journalTag.create({
          data: { journalId: id, tagId: tag.id },
        });
      }
    }

    return NextResponse.json({
      journal: {
        id: journal.id,
        title: journal.title,
        date: journal.date.toISOString().split('T')[0],
        updatedAt: journal.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating journal:', error);
    return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 });
  }
}

// DELETE - حذف يومية
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف اليومية مطلوب' }, { status: 400 });
    }

    await db.favorite.deleteMany({
      where: { journalId: id, userId },
    });

    await db.journalTag.deleteMany({
      where: { journalId: id },
    });

    await db.journalEntry.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 });
  }
}
