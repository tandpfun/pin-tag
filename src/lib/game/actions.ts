'use server';

import { ActionLogType, Participant } from '@prisma/client';
import { userAuth } from '../auth/hooks';
import { updateParticipants } from './database';
import { sendEliminationEmail, sendTargetEmail } from './email';
import prisma from '../prisma';

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

const eliminatedRecently = new Set();

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
    include: {
      target: { include: { user: true, target: { include: { user: true } } } },
      user: true,
    },
  });

  if (!participant) return { error: 'Invalid game' };
  if (eliminatedRecently.has(participant.id))
    return {
      error: 'You eliminated someone too recently. Try again in 5 minutes.',
    };
  if (!participant.target?.target)
    return { error: 'Target does not have a target' };

  // make sure the participant's target is what they specify
  if (participant.targetId !== targetId || participant.target == null)
    return { error: 'Invalid target' };

  // TODO: Add checks for game hours

  // Send new target and elimination email
  await sendTargetEmail({
    user,
    targetUser: participant.target.target.user,
    gameId,
    isNew: true,
  });
  await sendEliminationEmail({
    user: participant.target.user,
    assassinUser: user,
  });

  // Create action log
  await prisma.actionLog.create({
    data: {
      type: ActionLogType.ELIMINATE,
      gameId,
      participantId: participant.id,
      targetId: participant.targetId,
      timestamp: new Date(),
    },
  });

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

  eliminatedRecently.add(participant.id);
  setTimeout(() => eliminatedRecently.delete(participant.id), 1000 * 60 * 5);

  return { success: true };
}
