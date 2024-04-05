'use server';

import { ActionLogType, Participant, Role } from '@prisma/client';
import { userAuth } from '../auth/hooks';
import { updateGame, updateParticipants } from '../game/database';
import { sendTargetEmail } from '../game/email';

export async function startGame({ gameId }: { gameId: string }) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user || user.role !== Role.ADMIN) return { error: 'Unauthorized' };

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: { user: true, target: { include: { user: true } } },
      },
    },
  });
  if (!game) return { error: 'Game not found' };

  if (game.participants.length < 2)
    return { error: 'Must have at least 2 participants' };

  // Make sure every participant has a target
  if (game.participants.some((p) => !p.target))
    return { error: 'All participants must have a target' };

  // Mark as started
  const startedGame = await updateGame({
    id: game.id,
    isActive: true,
    isJoinable: false,
  });

  // Send emails to all participants
  await Promise.all(
    game.participants
      .filter((p) => p.isAlive && p.target != null)
      .map(async (p) =>
        sendTargetEmail({
          user: p.user,
          targetUser: p.target!.user,
          gameId: gameId,
          isNew: false,
        })
      )
  );

  // Log start to action log
  await prisma.actionLog.create({
    data: {
      gameId: game.id,
      type: ActionLogType.START,
      userId: user.id,
      timestamp: new Date(),
    },
  });

  return { success: true };
}

export async function emailTargets({ gameId }: { gameId: string }) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user || user.role !== Role.ADMIN) return { error: 'Unauthorized' };

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: { user: true, target: { include: { user: true } } },
      },
    },
  });
  if (!game) return { error: 'Game not found' };

  if (game.isActive) return { error: 'Game must be started' };

  if (game.participants.length < 1)
    return { error: 'Must have at least 1 participant' };

  // Send emails to all living participants
  await Promise.all(
    game.participants
      .filter((p) => p.isAlive && p.target != null) // Only send to participants with a target
      .map(async (p) =>
        sendTargetEmail({
          user: p.user,
          targetUser: p.target!.user,
          gameId: gameId,
          isNew: false,
        })
      )
  );

  // Log start to action log
  await prisma.actionLog.create({
    data: {
      gameId: game.id,
      type: ActionLogType.EMAIL,
      userId: user.id,
      timestamp: new Date(),
    },
  });

  return { success: true };
}

export async function shuffleTargets({ gameId }: { gameId: string }) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user || user.role !== Role.ADMIN) return { error: 'Unauthorized' };

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: true,
    },
  });
  if (!game) return { error: 'Unauthorized' };

  if (game.participants.length < 2)
    return { error: 'Must have at least 2 participants' };

  const aliveParticipants = game.participants.filter((p) => p.isAlive);

  // Assign targets to every participant
  const participantsNoTargets = aliveParticipants.map((p) => ({
    ...p,
    targetId: null,
  }));
  const participantsWithTargets = assignRandomTargets(aliveParticipants);

  // Update the participants
  await updateParticipants(participantsNoTargets); // Need to remove all targets to prevent unique constraint violation
  const addTargets = await updateParticipants(participantsWithTargets);

  // Log shuffle to action log
  await prisma.actionLog.create({
    data: {
      gameId: game.id,
      type: ActionLogType.SHUFFLE,
      userId: user.id,
      timestamp: new Date(),
    },
  });

  return { success: true };
}

function assignRandomTargets(participants: Participant[]) {
  const shuffled = shuffleArray(participants);

  const randomized = shuffled.map((participant, index) => ({
    ...participant,
    targetId: shuffled[(index + 1) % shuffled.length].id,
  }));

  return randomized;
}

function shuffleArray(input: any[]) {
  const array = [...input];
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
