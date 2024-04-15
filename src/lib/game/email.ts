import nodemailer from 'nodemailer';
import { render } from 'jsx-email';

import { userAuth } from '@/lib/auth/hooks';
import { Participant, Role, User } from '@prisma/client';
import { Template as TargetEmail } from '@/email/TargetEmail';
import { Template as EliminationEmail } from '@/email/EliminationEmail';
import Mail from 'nodemailer/lib/mailer';
import prisma from '../prisma';

const transport = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true,
  auth: {
    user: 'postmaster@pintag.thijs.gg',
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email queueing system to circumvent rate-limits
const emailQueue = new Set<Mail.Options>();
setInterval(async () => {
  const nextEmail = emailQueue.values().next().value;
  emailQueue.delete(nextEmail);

  if (nextEmail) {
    await transport
      .sendMail(nextEmail)
      .catch((err) => console.error(`[EMAIL ERROR] ${err.message}`));
  }
}, 1000);

export async function sendTargetEmail({
  user,
  targetUser,
  gameId,
  isNew,
  isRevival,
}: {
  user: User;
  targetUser: User;
  gameId: string;
  isNew?: boolean;
  isRevival?: boolean;
}) {
  const authToken = await prisma.authToken.findUnique({
    where: { userId: user.id },
  });

  const eliminationLink = `http://localhost:3000/api/auth/magic?t=${authToken?.token}&g=${gameId}&a=eliminate`;

  const emailHtml = await render(
    TargetEmail({
      name: user.firstName,
      target: targetUser,
      eliminationLink,
      isNew,
      isRevival,
    })
  );

  emailQueue.add({
    from: 'game@pintag.thijs.gg',
    sender: {
      name: 'LWHS PIN-TAG',
      address: 'game@pintag.thijs.gg',
    },
    to: user.email,
    subject: !isRevival
      ? `YOUR ${isNew ? 'NEW' : ''} PIN-TAG TARGET`
      : "YOU'VE BEEN REVIVED",
    html: emailHtml,
  });
}

export async function sendEliminationEmail({
  user,
  assassinUser,
}: {
  user: User;
  assassinUser?: User;
}) {
  const emailHtml = await render(
    EliminationEmail({
      name: user.firstName,
      assassin: assassinUser,
    })
  );

  emailQueue.add({
    from: 'game@pintag.thijs.gg',
    sender: {
      name: 'LWHS PIN-TAG',
      address: 'game@pintag.thijs.gg',
    },
    to: user.email,
    subject: `YOU'VE BEEN ELIMINATED`,
    html: emailHtml,
  });
}
