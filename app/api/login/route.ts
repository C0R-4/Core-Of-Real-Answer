import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!sitePassword) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let authValue = '';
    if (password === adminPassword && adminPassword) {
      authValue = 'admin';
    } else if (password === sitePassword) {
      authValue = 'authorized';
    }

    if (authValue) {
      const response = NextResponse.json({ success: true, role: authValue });

      // Set a simple auth cookie
      response.cookies.set('auth_token', authValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
