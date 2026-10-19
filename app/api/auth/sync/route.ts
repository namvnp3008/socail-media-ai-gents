import { NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authId, email, name, avatarUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists by email or authId
    const existingUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), authId ? eq(users.authId, authId) : undefined))
      .limit(1);

    const existingUser = existingUsers[0];

    if (!existingUser) {
      // First time signIn / signUp: insert into database
      const [newUser] = await db
        .insert(users)
        .values({
          authId: authId || null,
          email,
          name: name || email.split('@')[0],
          avatarUrl: avatarUrl || null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        isNewUser: true,
        user: newUser,
      });
    }

    // Update authId or avatar if missing
    if ((authId && !existingUser.authId) || (avatarUrl && !existingUser.avatarUrl) || (name && !existingUser.name)) {
      const [updatedUser] = await db
        .update(users)
        .set({
          authId: authId || existingUser.authId,
          name: name || existingUser.name,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: updatedUser,
      });
    }

    return NextResponse.json({
      success: true,
      isNewUser: false,
      user: existingUser,
    });
  } catch (error: any) {
    console.error('Error syncing user to database:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
