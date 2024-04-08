import { userAuth } from '@/lib/auth/hooks';
import { createUser } from '@/lib/auth/database';
import { createGame, createParticipant, updateGame } from '@/lib/game/database';
import { Game, Participant, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
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
    include: { participants: true },
  });
  if (!game) return Response.json({ error: 'Unknown game' }, { status: 400 });

  // Create 50 users & participants

  for (let i = 0; i < 50; i++) {
    const user = await createUser({
      email: `spam.codingpro+${
        faker.person.firstName() + Date.now()
      }@gmail.com`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gradYear: 2024,
    });

    const participant = await createParticipant({
      gameId: game.id,
      userId: user.id,
    });
  }

  return Response.json({ success: true }, { status: 200 });
}
