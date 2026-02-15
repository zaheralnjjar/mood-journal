import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// إنشاء معرف مستخدم مؤقت (للتجربة بدون تسجيل دخول)
function generateTempUserId(): string {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// GET - جلب بيانات المستخدم
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');

    // إذا لم يكن هناك مستخدم، أنشئ واحداً جديداً
    if (!userId) {
      const tempUser = await db.user.create({
        data: {
          id: generateTempUserId(),
          email: `${generateTempUserId()}@temp.local`,
          settings: {
            theme: 'light',
            primaryColor: '#8b5cf6',
            fontFamily: 'Cairo',
            fontSize: 16,
            language: 'ar',
            showPrayerTimes: true,
            showWeather: true,
            showHijriDate: true,
            autoBackup: false,
            backupInterval: 'weekly',
          },
        },
      });
      userId = tempUser.id;
      
      return NextResponse.json({
        user: {
          id: tempUser.id,
          email: tempUser.email,
          name: tempUser.name,
          settings: tempUser.settings,
          isNew: true,
        },
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        settings: user.settings,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بيانات المستخدم
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        settings,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
