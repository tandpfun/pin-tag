import { userAuth } from '@/lib/auth/hooks';
import {
  getEliminationLeaderboard,
  getGameStatus,
  gradYearToGrade,
} from '@/lib/game/hooks';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React, { use } from 'react';
import TargetCard from './TargetCard';
import { Participant, User } from '@prisma/client';
import GameCard from './GameCard';
import { render } from 'jsx-email';
import { Template } from '@/email/TargetEmail';

function userToFullName(user?: User) {
  return `${user?.firstName} ${user?.lastName} '${user?.gradYear
    .toString()
    .substring(2)}`;
}

const nthNumber = (number: number) => {
  if (number > 3 && number < 21) return 'th';
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const leaderIcons = ['👑', '🥈', '🥉'];

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const user = await userAuth();
  const gameStatus = await getGameStatus(params.gameId, user?.id);

  if (!user || !gameStatus) redirect('/');

  const elimLeaderboard = await getEliminationLeaderboard(params.gameId);

  const { game, participant } = gameStatus;
  const targetUser = participant.target?.user;

  return (
    <div className="w-screen justify-center flex">
      <div className="max-w-5xl w-full mt-4 sm:mt-12 px-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold">{game.name}</h1>
          {game.isActive ? (
            participant.isAlive ? (
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <div className="mt-2 sm:mt-4">
                  {game.aliveCount}/{game.participantCount} participants remain.
                </div>

                <GameCard
                  className="bg-green-600/10 col-span-2"
                  from="FBI Director Kim"
                  fromColor="text-green-500"
                >
                  <span className="text-green-500">Agent {user.firstName}</span>
                  , your task is to pin{' '}
                  <span className="text-green-500">
                    {userToFullName(targetUser)}
                  </span>
                  . When you pin your target, you must let us know immediately
                  by clicking the &quot;eliminate&quot; button below.
                </GameCard>

                <TargetCard
                  firstName={targetUser?.firstName}
                  lastName={targetUser?.lastName}
                  gradYear={targetUser?.gradYear}
                  eliminationCount={
                    participant.target?.eliminatedTargets.length
                  }
                  gameId={game.id}
                  targetId={participant.target?.id}
                />

                {elimLeaderboard && (
                  <GameCard
                    className="bg-blue-600/10 w-full"
                    from="Leaderboard"
                    fromColor="text-blue-600"
                  >
                    <div>
                      {elimLeaderboard?.slice(0, 5).map((part, index) => (
                        <div
                          className={
                            index === 0
                              ? 'sm:text-2xl text-lg'
                              : 'sm:text-lg text-base'
                          }
                          key={part.id}
                        >
                          {leaderIcons[index] != null
                            ? leaderIcons[index]
                            : `${index + 1}.`}{' '}
                          <span className="font-bold">
                            {part.user.firstName} {part.user.lastName}
                          </span>{' '}
                          ({part.eliminatedTargets.length} pins)
                        </div>
                      ))}
                      {!elimLeaderboard
                        ?.slice(0, 5)
                        .find((p) => p.userId == user.id) && (
                        <div className="sm:text-lg text-base">
                          {elimLeaderboard
                            .map((p) => p.userId)
                            .indexOf(user.id) + 1}
                          .{' '}
                          <span className="font-bold">
                            {user.firstName} {user.lastName}
                          </span>{' '}
                          ({participant.eliminatedTargets.length} pins)
                        </div>
                      )}
                    </div>
                  </GameCard>
                )}

                {elimLeaderboard && (
                  <GameCard
                    className="bg-blue-600/10 w-full"
                    from="Game Log"
                    fromColor="text-blue-600"
                  >
                    <ul className="text-md sm:text-base">
                      {game.actionLogs.map((log) => (
                        <li key={log.id}>
                          ❌ {log.user?.firstName} {log.user?.lastName}{' '}
                          <span className="text-red-500">pinned</span>{' '}
                          {
                            elimLeaderboard.find((p) => p.id === log.targetId)
                              ?.user.firstName
                          }{' '}
                          {
                            elimLeaderboard.find((p) => p.id === log.targetId)
                              ?.user.lastName
                          }
                        </li>
                      ))}
                    </ul>
                  </GameCard>
                )}

                <GameCard
                  className="bg-blue-600/10 hidden"
                  from="Leaderboard"
                  fromColor="text-blue-600"
                >
                  Your task is to pin{' '}
                  <span className="text-blue-600">
                    {userToFullName(targetUser)}
                  </span>
                  . Once you pin them, you must ask them who their target is.
                  You will need to verify their next target here to eliminate
                  them.
                </GameCard>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="mt-4">
                  <span className="text-red-500">
                    You&apos;ve been eliminated.
                  </span>{' '}
                  {game.aliveCount}/{game.participantCount} competitors remain.
                </div>

                <GameCard
                  className="bg-red-600/20"
                  from="FBI Director Kim"
                  fromColor="text-red-600"
                >
                  <span className="text-red-500">Agent {user.firstName}</span>,
                  you were eliminated
                  {participant.eliminatedById ? (
                    <>
                      by{' '}
                      <span className="text-red-500">
                        {userToFullName(participant.eliminatedBy?.user)}
                      </span>
                    </>
                  ) : null}
                  . You got{' '}
                  {participant.place + nthNumber(participant.place || 0)} place.
                  Keep your eyes peeled for a revival round!
                </GameCard>

                <div className="bg-purple-600/10 border-2 border-purple-600 p-6 mt-4 relative">
                  <div>
                    <div className="flex gap-4">
                      <div className="">
                        <Image
                          src="/thijs.jpg"
                          width={200}
                          height={200}
                          alt="Photo of target"
                          className="filter grayscale"
                        />
                      </div>
                      <div className="text-xl flex flex-col">
                        <div className="font-bold text-2xl mb-2 uppercase">
                          AGENT {userToFullName(user)}
                        </div>
                        <div>
                          <b>NAME:</b>
                        </div>
                        <div>
                          <b>GRADE:</b>
                        </div>
                        <div>
                          <b>ELIMINATIONS:</b>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <div className="font-bold text-2xl border-2 px-2 border-purple-600">
                      PINTAG-{new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <div className="mt-4">
                {game.participantCount} participants have joined!
              </div>

              <GameCard
                className="bg-green-600/10"
                from="FBI Director Kim"
                fromColor="text-green-500"
              >
                Welcome,{' '}
                <span className="text-green-500">Agent {user.firstName}</span>.
                This is your mission portal, where you&apos;ll find out exactly
                who you need to tag. The game has not started yet. I&apos;ll
                send you an email once your target has been assigned. Good luck!
              </GameCard>

              <GameCard
                className="bg-blue-600/10"
                from="Mission Tracker"
                fromColor="text-blue-600"
              >
                <div className="text-lg animate-pulse">
                  Awaiting assignment...
                </div>
              </GameCard>
            </div>
          )}
        </div>

        <div></div>
      </div>
    </div>
  );
}
