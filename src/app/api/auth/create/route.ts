import { createUser, generateAuthToken } from '@/lib/auth/database';
import { PrismaClient, User } from '@prisma/client';

export async function POST(request: Request) {
  const body = await request.json().catch((_) => null);
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const { email, firstName, lastName, gradYear }: User = body;

  const user = await createUser({ email, firstName, lastName, gradYear });

  // Next, create an authentication token for the user
  const createdToken = await generateAuthToken(user.id);

  return Response.json(
    { userId: user.id },
    {
      status: 200,
      headers: {
        'Set-Cookie': `token=${createdToken.token}; Path=/; HttpOnly`,
      },
    }
  );
}
