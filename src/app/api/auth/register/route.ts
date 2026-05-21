import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcrypt';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid request';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      // Never return the password hash to the client.
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
