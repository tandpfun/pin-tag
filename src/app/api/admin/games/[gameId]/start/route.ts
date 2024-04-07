import { userAuth } from '@/lib/auth/hooks';
import { createGame, updateGame } from '@/lib/game/database';
import { sendTargetEmail } from '@/lib/game/email';
import { Game, Role } from '@prisma/client';
import prisma from '../../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Make sure the user is admin
  const auth = await userAuth();
  if (!auth || auth.role !== Role.ADMIN)
    return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const { gameId } = params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: { user: true, target: { include: { user: true } } },
      },
    },
  });
  if (!game) return Response.json({ error: 'Unknown game' }, { status: 400 });

  if (game.participants.length < 2)
    return Response.json(
      { error: 'Must have at least 2 participants' },
      { status: 400 }
    );

  // Make sure every participant has a target
  if (game.participants.some((p) => !p.target))
    return Response.json(
      { error: 'All participants must have a target' },
      { status: 400 }
    );

  // Mark as started
  const startedGame = await updateGame({
    id: game.id,
    isActive: true,
    isJoinable: false,
  });

  // Send emails to all participants
  await Promise.all(
    game.participants.map(async (p) =>
      sendTargetEmail({
        user: p.user,
        targetUser: p.target!.user,
        gameId: gameId,
        isNew: false,
      })
    )
  );

  return Response.json(startedGame, {
    status: 200,
  });
}
