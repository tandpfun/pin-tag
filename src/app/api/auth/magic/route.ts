import { getUserByToken } from '@/lib/auth/database';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

// /api/auth/magic?t=token&g=gameId&a=action
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const token = searchParams.get('t');
  const gameId = searchParams.get('g');
  const action = searchParams.get('a');

  if (!token) return Response.json({ error: 'Invalid token' }, { status: 400 });
  if (!gameId)
    return Response.json({ error: 'Invalid game id' }, { status: 400 });

  const user = await getUserByToken(token);

  if (!user) return Response.json({ error: 'Invalid token' }, { status: 400 });

  const response = NextResponse.redirect(
    `${process.env.BASE_URL}/game/${gameId}`,
    {
      status: 302,
    }
  );

  response.cookies.set('token', token, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}
