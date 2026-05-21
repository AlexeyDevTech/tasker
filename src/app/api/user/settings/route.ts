import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        preferredWorkTime: true,
        preferredTheme: true,
      },
    });

    if (!user) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_SETTINGS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, timezone, preferredWorkTime } = body;

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        timezone,
        preferredWorkTime,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('[USER_SETTINGS_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
