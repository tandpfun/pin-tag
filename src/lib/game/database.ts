import {
  Game,
  Participant,
  PrismaClient,
  Role,
  User,
  Prisma,
} from '@prisma/client';
import prisma from '../prisma';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type OptionalAll<T, K extends keyof T> = Pick<T, K> & Partial<T>;

function defaultGame() {
  return {
    name: '',
    isActive: false,
  };
}

function defaultParticipant() {
  return {
    userId: '',
    gameId: '',
    isAlive: true,
  };
}

export async function createGame(game: Partial<Game>) {
  return prisma.game.create({ data: { ...defaultGame(), ...game } });
}

export async function updateGame(game: Partial<Game>) {
  return prisma.game.update({ where: { id: game.id }, data: game });
}

export async function getJoinableGames() {
  return prisma.game.findMany({ where: { isJoinable: true } });
}

export async function createParticipant(participant: Partial<Participant>) {
  return prisma.participant.create({
    data: { ...defaultParticipant(), ...participant },
  });
}

export async function updateParticipants(
  participants: OptionalAll<Participant, 'id'>[]
) {
  return await prisma.$transaction(async (tx) => {
    const updates = participants.map((participant) =>
      tx.participant.update({
        where: { id: participant.id },
        data: participant,
      })
    );
    return Promise.all(updates);
  });
}
