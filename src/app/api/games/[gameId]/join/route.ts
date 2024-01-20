import { updateUser } from '@/lib/auth/database';
import { userAuth } from '@/lib/auth/hooks';
import { createGame, createParticipant } from '@/lib/game/database';
import { Game, Role } from '@prisma/client';

// Adds a user to a game
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Make sure the user is logged in
  const auth = await userAuth();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const { gameId } = params;

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
    userId: auth.id,
  });

  // Add default game to the user
  await updateUser({
    id: auth.id,
    activeGameId: game.id,
  });

  return Response.json(participant, {
    status: 200,
  });
}
