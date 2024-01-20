import nodemailer from 'nodemailer';
import { render } from 'jsx-email';

import { userAuth } from '@/lib/auth/hooks';
import { Role } from '@prisma/client';
import { Template } from '@/email/TargetEmail';

const transport = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true,
  auth: {
    user: 'postmaster@pintag.thijs.gg',
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  // Make sure the user is admin
  const auth = await userAuth();
  if (!auth || auth.role !== Role.ADMIN)
    return Response.json({ error: 'Unauthorized' }, { status: 403 });

  if (!auth.activeGameId) return;

  const participant = await prisma.participant.findUnique({
    where: { userId_gameId: { userId: auth.id, gameId: auth.activeGameId } },
    include: { target: { include: { user: true } } },
  });
  if (!participant?.target) return;

  const authToken = await prisma.authToken.findUnique({
    where: { userId: auth.id },
  });

  const eliminationLink = `http://localhost:3000/api/auth/magic?t=${authToken?.token}&g=${auth.activeGameId}&a=eliminate`;

  const emailHtml = await render(
    Template({
      name: auth.firstName,
      target: participant.target.user,
      eliminationLink: eliminationLink,
    })
  );

  await transport.sendMail({
    from: 'game@pintag.thijs.gg',
    sender: {
      name: 'Pin-Tag',
      address: 'game@pintag.thijs.gg',
    },
    to: auth.email,
    subject: 'Your Pin-Tag Target',
    html: emailHtml,
  });

  return Response.json(
    { success: true },
    {
      status: 200,
    }
  );
}
