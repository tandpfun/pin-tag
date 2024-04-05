import { PrismaClient } from '@prisma/client';
import { getJoinableGames } from './database';
import prisma from '../prisma';

export async function useJoinableGames() {
  return await getJoinableGames();
}

export async function getGameList() {
  return await prisma.game.findMany({ include: { participants: true } });
}

export async function getGame(gameId: string) {
  return await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      participants: {
        include: {
          user: true,
          target: { include: { user: true } },
          assassin: { include: { user: true } },
          eliminatedBy: { include: { user: true } },
          eliminatedTargets: true,
        },
      },
      actionLogs: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function getGameStatus(gameId: string, userId?: string) {
  if (!userId) return null;

  const game = await prisma.game.findUnique({
    where: { id: gameId, participants: { some: { userId } } }, // Make sure user is in game
    include: { participants: true },
  });
  if (!game) return null;

  const participant = await prisma.participant.findUnique({
    where: { userId_gameId: { userId, gameId } },
    include: {
      target: { include: { user: true, eliminatedTargets: true } },
      eliminatedBy: { include: { user: true } },
      eliminatedTargets: { include: { user: true } },
    },
  });
  if (!participant) return null;

  const target = participant.target;
  const eliminatedBy = participant.eliminatedBy;

  const participantCount = game.participants.length;
  const aliveCount = game.participants.filter((p) => p.isAlive).length;

  const eliminatedParticipants = game.participants
    .filter((p) => !p.isAlive)
    .sort(
      (a, b) =>
        new Date(a.eliminatedAt || 0).getTime() -
        new Date(b.eliminatedAt || 0).getTime()
    );

  const place =
    eliminatedParticipants.findIndex((p) => p.id === participant.id) +
    aliveCount;

  return {
    game: {
      id: game.id,
      name: game.name,
      isActive: game.isActive,
      isJoinable: game.isJoinable,
      participantCount,
      aliveCount,
    },
    participant: {
      ...participant,
      place,
    },
  };
}

export async function getEliminationLeaderboard(gameId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId }, // Make sure user is in game
    include: {
      participants: { include: { user: true, eliminatedTargets: true } },
    },
  });
  if (!game) return null;

  const sortedParticipants = game.participants.sort(
    (a, b) => b.eliminatedTargets.length - a.eliminatedTargets.length
  );

  return sortedParticipants;
}

export function gradYearToGrade(gradYear: number) {
  const currentYear = new Date().getFullYear();
  const grades = ['Senior', 'Junior', 'Sophomore', 'Frosh'];
  return grades[currentYear - gradYear];
}
