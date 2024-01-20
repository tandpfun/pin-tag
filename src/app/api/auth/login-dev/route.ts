import { PrismaClient } from '@prisma/client';

import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return Response.json({ error: 'Invalid id' }, { status: 400 });

  const userToken = await prisma.authToken.findFirst({ where: { userId: id } });

  if (!userToken)
    return Response.json({ error: 'No token found' }, { status: 400 });

  return Response.json(
    { userId: userToken.userId },
    {
      status: 200,
      headers: { 'Set-Cookie': `token=${userToken.token}; Path=/` },
    }
  );
}
