import { PrismaClient, Role, User } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import prisma from '../prisma';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type OptionalAll<T, K extends keyof T> = Pick<T, K> & Partial<T>;

function defaultUser() {
  const userId = createId();
  return {
    id: userId,
    email: '',
    firstName: '',
    lastName: '',
    gradYear: 0,
    role: Role.USER,
  };
}

export async function createUser(user: Partial<User>) {
  return prisma.user.create({ data: { ...defaultUser(), ...user } });
}

export async function updateUser(user: Partial<User>) {
  return prisma.user.update({ where: { id: user.id }, data: user });
}

export async function getUserByToken(token: string) {
  const authToken = await prisma.authToken.findUnique({ where: { token } });

  if (!authToken) return null;

  return prisma.user.findUnique({ where: { id: authToken.userId } });
}

export async function generateAuthToken(userId: string) {
  const token = `${btoa(userId)}.${btoa(Date.now().toString())}.${createId()}`; // userId.timestamp.token

  return await prisma.authToken.create({ data: { token, userId, uses: 0 } });
}
