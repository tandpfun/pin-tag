'use server';

import { Participant } from '@prisma/client';
import { userAuth } from '../auth/hooks';
import { updateParticipants } from './database';

export async function requestElimination({
  targetId,
  gameId,
}: {
  targetId: string;
  gameId: string;
}) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user) return { error: 'Unauthorized' };

  const participant = await prisma.participant.findUnique({
    where: { userId_gameId: { userId: user.id, gameId } },
  });

  if (!participant) return { error: 'Invalid game' };

  // make sure the participant's target is what they specify
  if (participant.targetId !== targetId) return { error: 'Invalid target' };

  return { success: true };
}

export async function eliminateTarget({
  targetId,
  gameId,
}: {
  targetId: string;
  gameId: string;
}) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user) return { error: 'Unauthorized' };

  const participant = await prisma.participant.findUnique({
    where: { userId_gameId: { userId: user.id, gameId } },
    include: { target: true },
  });
  if (!participant) return { error: 'Invalid game' };

  // make sure the participant's target is what they specify
  if (participant.targetId !== targetId || participant.target == null)
    return { error: 'Invalid target' };

  // TODO: Add checks for game hours
  // TODO: Send emails

  const updatedTarget = {
    id: participant.targetId,
    targetId: null,
    isAlive: false,
    eliminatedById: participant.id,
    eliminatedAt: new Date(),
  };
  const updatedParticipant = {
    id: participant.id,
    targetId: participant.target.targetId, // Set the target's target to the new target
  };

  const update = await updateParticipants([updatedTarget, updatedParticipant]);

  return { success: true };
}
