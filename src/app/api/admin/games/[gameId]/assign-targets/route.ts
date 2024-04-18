import { userAuth } from '@/lib/auth/hooks';
import { updateParticipants } from '@/lib/game/database';
import prisma from '@/lib/prisma';
import { Participant, Role } from '@prisma/client';

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

  if (game.participants.length < 2)
    return Response.json(
      { error: 'Must have at least 2 participants' },
      { status: 400 }
    );

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

  return Response.json(addTargets, { status: 200 });
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
