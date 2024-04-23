import nodemailer from 'nodemailer';
import { render } from 'jsx-email';

import { userAuth } from '@/lib/auth/hooks';
import { Participant, Role, User } from '@prisma/client';
import { Template as TargetEmail } from '@/email/TargetEmail';
import { Template as EliminationEmail } from '@/email/EliminationEmail';
import Mail from 'nodemailer/lib/mailer';
import prisma from '../prisma';
import { ThrottledQueue } from '../util/ThrottledQueue';

const transport = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const mailQueue = new ThrottledQueue<Mail.Options>({
  handler: async (data) => {
    console.log('Emailing', data.to);

    await transport.sendMail(data).catch((err) => {
      console.error(
        `[EMAIL ERROR] Failed to email ${data.to}.\n${err.message}\nRetrying in 30 seconds...`
      );
      setTimeout(() => {
        mailQueue.push(data);
      }, 30000);
    });
  },
  timeout: 1000,
});

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

  const eliminationLink = `${process.env.BASE_URL}/api/auth/magic?t=${authToken?.token}&g=${gameId}&a=eliminate`;

  const emailHtml = await render(
    TargetEmail({
      name: user.firstName,
      target: targetUser,
      eliminationLink,
      isNew,
      isRevival,
    })
  );

  mailQueue.push({
    from: 'game@pintag.thijs.gg',
    replyTo: 'pintag2024@gmail.com',
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
  gameId,
}: {
  user: User;
  assassinUser?: User;
  gameId: string;
}) {
  const authToken = await prisma.authToken.findUnique({
    where: { userId: user.id },
  });

  const eliminationLink = `${process.env.BASE_URL}/api/auth/magic?t=${authToken?.token}&g=${gameId}`;

  const emailHtml = await render(
    EliminationEmail({
      name: user.firstName,
      assassin: assassinUser,
      eliminationLink,
    })
  );

  mailQueue.push({
    from: 'game@pintag.thijs.gg',
    replyTo: 'pintag2024@gmail.com',
    sender: {
      name: 'LWHS PIN-TAG',
      address: 'game@pintag.thijs.gg',
    },
    to: user.email,
    subject: `YOU'VE BEEN ELIMINATED`,
    html: emailHtml,
  });
}
