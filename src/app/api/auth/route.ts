import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// دالة إنشاء التوكن
function generateToken(userId: string): string {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// دالة التحقق من التوكن
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET - التحقق من الجلسة الحالية
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'لا يوجد جلسة نشطة' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'الجلسة منتهية' 
      });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        settings: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'المستخدم غير موجود' 
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      message: 'خطأ في التحقق' 
    }, { status: 500 });
  }
}

// POST - تسجيل / دخول / خروج
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    // === تسجيل مستخدم جديد ===
    if (action === 'register') {
      if (!email || !password) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
        }, { status: 400 });
      }

      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني مستخدم بالفعل' 
        }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || email.split('@')[0],
          settings: {
            theme: 'light',
            primaryColor: '#8b5cf6',
            fontFamily: 'Cairo',
            fontSize: 16,
            language: 'ar',
            showPrayerTimes: true,
            showWeather: true,
            showHijriDate: true,
          },
        },
      });

      const token = generateToken(user.id);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const response = NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          settings: user.settings,
        },
        token,
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 يوم
        path: '/',
      });

      return response;
    }

    // === تسجيل الدخول ===
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
        }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.password) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
        }, { status: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
        }, { status: 401 });
      }

      const token = generateToken(user.id);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const response = NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          settings: user.settings,
        },
        token,
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return response;
    }

    // === تسجيل الخروج ===
    if (action === 'logout') {
      const token = request.cookies.get('auth_token')?.value;

      if (token) {
        await db.session.deleteMany({
          where: { token },
        });
      }

      const response = NextResponse.json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح',
      });

      response.cookies.delete('auth_token');

      return response;
    }

    return NextResponse.json({ 
      error: 'إجراء غير معروف' 
    }, { status: 400 });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 });
  }
}
