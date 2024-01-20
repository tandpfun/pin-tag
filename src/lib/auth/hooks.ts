import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { cookies } from 'next/headers';
import { getUserByToken } from './database';

export async function userAuth() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie?.value) return null;

  return await getUserByToken(tokenCookie.value);
}
