import { updateUser } from '@/lib/auth/database';
import { userAuth } from '@/lib/auth/hooks';
import { createGame, createParticipant } from '@/lib/game/database';
import { Game, Role } from '@prisma/client';

import prisma from '../../../../../lib/prisma';

// Adds a user to a game
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Check for API token
  const token = request.headers.get('Authorization');
  if (!token || token !== `Bearer ${process.env.API_TOKEN}`)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { gameId } = params;

  const body = await request.json().catch((_) => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { userId }: { userId: string } = body;

  const game = await await prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) return Response.json({ error: 'Unknown game' }, { status: 400 });
  if (!game.isJoinable)
    return Response.json(
      { error: 'This game is no longer joinable' },
      { status: 400 }
    );

  // Create a participant within the game
  const participant = await createParticipant({
    gameId: game.id,
    userId: userId,
  });

  // Add default game to the user
  await updateUser({
    id: userId,
    activeGameId: game.id,
  });

  return Response.json(participant, {
    status: 200,
  });
}
