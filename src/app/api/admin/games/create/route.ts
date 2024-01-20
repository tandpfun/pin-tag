import { userAuth } from '@/lib/auth/hooks';
import { createGame } from '@/lib/game/database';
import { Game, Role } from '@prisma/client';

export async function POST(request: Request) {
  // Make sure the user is admin
  const auth = await userAuth();
  if (!auth || auth.role !== Role.ADMIN)
    return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json().catch((_) => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { name }: Game = body;

  const newGame = await createGame({ name });

  return Response.json(newGame, {
    status: 200,
  });
}
