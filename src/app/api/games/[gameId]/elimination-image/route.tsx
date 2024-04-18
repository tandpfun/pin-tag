import { userAuth } from '@/lib/auth/hooks';
import { getAvatarUrl } from '@/lib/game/hooks';
import prisma from '@/lib/prisma';
import { readFileSync } from 'fs';
import { JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import { ImageResponse } from 'next/og';
import path from 'path';
import { fileURLToPath } from 'url';
// App router includes @vercel/og.
// No need to install it.

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const auth = await userAuth();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const participant = await prisma.participant.findUnique({
    where: { userId_gameId: { userId: auth.id, gameId: params.gameId } },
    include: {
      eliminatedTargets: true,
      game: { include: { participants: true } },
      user: true,
    },
  });

  if (!participant)
    return Response.json({ error: 'Invalid game' }, { status: 400 });

  if (participant.isAlive)
    return Response.json(
      { error: 'Participant is still alive' },
      { status: 400 }
    );

  const eliminatedGameParticipants = participant.game.participants
    .filter((p) => !p.isAlive)
    .sort(
      (a, b) =>
        new Date(b.eliminatedAt || 0).getTime() -
        new Date(a.eliminatedAt || 0).getTime()
    );
  const aliveCount = participant.game.participants.filter(
    (p) => p.isAlive
  ).length;
  const place =
    eliminatedGameParticipants.findIndex((p) => p.id === participant.id) +
    aliveCount +
    1;

  // Import fonts
  const boldFontData = readFileSync(
    path.join(fileURLToPath(import.meta.url), '../assets/jetbrains_b.ttf')
  );
  const extraboldFontData = readFileSync(
    path.join(fileURLToPath(import.meta.url), '../assets/jetbrains_eb.ttf')
  );

  return new ImageResponse(
    (
      <div
        style={{
          color: 'white',
          background: 'linear-gradient(to top right, #821515, #1E0707)',
          width: '100%',
          height: '100%',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            borderRadius: '28px',
            overflow: 'hidden',
            height: '340px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src={getAvatarUrl(participant.user.avatar) || undefined}
            alt="photo"
            style={{
              objectPosition: 'top',
              objectFit: 'cover',
              marginTop: '-50px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom left, rgba(239, 20, 20, 0.3), rgba(239, 20, 20, 0.6))',
              zIndex: '1',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        <div
          style={{
            marginTop: '30px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"MonoEB"',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '30px', color: '#FF4949' }}>AGENT</div>
            <div
              style={{
                fontSize: '90px',
                lineHeight: '100%',
                marginTop: '10px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {participant?.user.firstName} {participant?.user.lastName}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '20px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <div style={{ fontSize: '30px', color: '#FF4949' }}>PLACED</div>
              <div
                style={{
                  fontSize: '90px',
                  lineHeight: '100%',
                  marginTop: '10px',
                  display: 'flex',
                }}
              >
                #{place}
              </div>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <div style={{ fontSize: '30px', color: '#FF4949' }}>
                PIN COUNT
              </div>
              <div
                style={{
                  fontSize: '90px',
                  lineHeight: '100%',
                  marginTop: '10px',
                  display: 'flex',
                }}
              >
                {participant.eliminatedTargets.length}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '30px',
            left: '30px',
          }}
        >
          <div
            style={{
              border: '6px solid #FF4949',
              padding: '3px 10px 0px 10px',
              fontFamily: 'MonoEB',
              fontSize: '36px',
            }}
          >
            PINTAG &apos;24
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 1060,
      fonts: [
        { name: 'MonoB', data: boldFontData, style: 'normal' },
        { name: 'MonoEB', data: extraboldFontData, style: 'normal' },
      ],
    }
  );
}
