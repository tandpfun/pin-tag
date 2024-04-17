'use server';

import { ActionLogType, Participant, Role } from '@prisma/client';
import { userAuth } from '../auth/hooks';
import { updateGame, updateParticipants } from '../game/database';
import { sendEliminationEmail, sendTargetEmail } from '../game/email';
import prisma from '../prisma';

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

export async function eliminateParticipant({
  participantId,
  emailParticipants,
}: {
  participantId: string;
  emailParticipants: boolean;
}) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user || user.role !== Role.ADMIN) return { error: 'Unauthorized' };

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      target: { include: { user: true } },
      assassin: { include: { user: true } },
      user: true,
    },
  });

  if (!participant) return { error: 'Participant not found' };
  if (!participant.target || !participant.assassin)
    return { error: 'User missing target or assassin' };

  const updatedParticipant = {
    id: participant.id,
    targetId: null,
    isAlive: false,
    eliminatedById: undefined,
    eliminatedAt: new Date(),
  };
  const updatedAssassin = {
    id: participant.assassin.id,
    targetId: participant.targetId, // Set the target's target to the new target
  };

  const update = await updateParticipants([
    updatedParticipant,
    updatedAssassin,
  ]);

  // Create action log
  await prisma.actionLog.create({
    data: {
      type: ActionLogType.ELIMINATE,
      gameId: participant.gameId,
      userId: user.id,
      targetId: participant.id,
      timestamp: new Date(),
    },
  });

  if (emailParticipants) {
    // Send new target and elimination email
    await sendTargetEmail({
      user: participant.assassin.user,
      targetUser: participant.target.user,
      gameId: participant.gameId,
      isNew: true,
    });
    await sendEliminationEmail({
      user: participant.user,
      gameId: participant.gameId,
    });
  }

  return { success: true };
}

export async function reviveParticipant({
  gameId,
  participantId,
  newTargetId,
  emailParticipants,
}: {
  gameId: string;
  participantId: string;
  newTargetId?: string;
  emailParticipants: boolean;
}) {
  // Make sure the user is logged in
  const user = await userAuth();
  if (!user || user.role !== Role.ADMIN) return { error: 'Unauthorized' };

  if (!newTargetId) return { error: 'Please specify a new target' };

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: {
          user: true,
          target: true,
          assassin: { include: { user: true } },
        },
      },
    },
  });

  if (!game) return { error: 'Game not found' };

  const participant = game.participants.find((p) => p.id === participantId);
  const newTarget = game.participants.find((p) => p.id === newTargetId);

  if (!participant || !newTarget) return { error: 'Participants not found' };

  if (participant.isAlive) return { error: 'Participant is not eliminated' };
  if (!newTarget.isAlive) return { error: 'Specified target is not alive' };

  const newAssassin = newTarget.assassin;

  if (!newAssassin) return { error: 'Target does not have a current assassin' };

  // Create action log
  await prisma.actionLog.create({
    data: {
      type: ActionLogType.REVIVE,
      gameId: participant.gameId,
      userId: user.id,
      participantId: participant.id,
      timestamp: new Date(),
    },
  });

  const updatedParticipant = {
    id: participant.id,
    targetId: newTarget.id,
    isAlive: true,
    eliminatedById: undefined,
    eliminatedAt: undefined,
  };
  const updatedAssassin = {
    id: newAssassin.id,
    targetId: participant.id,
  };

  const update = await updateParticipants([
    updatedAssassin,
    updatedParticipant,
  ]);

  if (emailParticipants) {
    // Send new target emails
    await sendTargetEmail({
      user: newAssassin.user,
      targetUser: participant.user,
      gameId: participant.gameId,
      isNew: true,
    });
    await sendTargetEmail({
      user: participant.user,
      targetUser: newTarget.user,
      gameId: participant.gameId,
      isRevival: true,
    });
  }

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

  if (!game.isActive) return { error: 'Game must be started' };

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
