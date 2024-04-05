'use client';

import GameCard from '@/app/game/[gameId]/GameCard';
import { ActionLog, ActionLogType, Prisma } from '@prisma/client';
import Image from 'next/image';
import React, { useState } from 'react';

type ConfigPage = 'control' | 'participants' | 'log' | 'stats';

export function ConfigButton({
  selected,
  pageName,
  onClick,
}: {
  selected: boolean;
  pageName: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`transition text-white font-bold py-2 px-4 ${
        selected ? 'bg-blue-600' : 'bg-blue-600/60 hover:bg-blue-600/50'
      }`}
      onClick={onClick}
    >
      {pageName}
    </button>
  );
}

type GameWithEverything = Prisma.GameGetPayload<{
  include: {
    participants: {
      include: {
        user: true;
        target: { include: { user: true } };
        assassin: { include: { user: true } };
        eliminatedBy: { include: { user: true } };
        eliminatedTargets: true;
      };
    };
    actionLogs: {
      include: {
        user: true;
      };
    };
  };
}>;

type ParticipantsWithEverything = Prisma.ParticipantGetPayload<{
  include: {
    user: true;
    target: { include: { user: true } };
    assassin: { include: { user: true } };
    eliminatedBy: { include: { user: true } };
    eliminatedTargets: true;
  };
}>;

type ActionLogWithEverything = Prisma.ActionLogGetPayload<{
  include: {
    user: true;
  };
}>;

export default function AdminConfig({ game }: { game: GameWithEverything }) {
  const [configPage, setConfigPage] = useState<ConfigPage>('control');

  return (
    <div className="my-6 w-full">
      <div className="flex flex-row gap-4">
        <ConfigButton
          pageName="Game Control"
          selected={configPage === 'control'}
          onClick={() => setConfigPage('control')}
        />
        <ConfigButton
          pageName="Participants"
          selected={configPage === 'participants'}
          onClick={() => setConfigPage('participants')}
        />
        <ConfigButton
          pageName="Action Log"
          selected={configPage === 'log'}
          onClick={() => setConfigPage('log')}
        />
        <ConfigButton
          pageName="Statistics"
          selected={configPage === 'stats'}
          onClick={() => setConfigPage('stats')}
        />
      </div>
      <div className="my-6 w-full">
        {configPage === 'control' && (
          <div className="flex flex-col gap-6">
            <GameCard
              className="bg-green-600/10"
              from="Start Game"
              fromColor="text-green-500"
            >
              <div>
                <div>
                  <div className="text-xl font-bold">Start Game</div>
                  <div className="text-sm mt-1">
                    Start the game and send out target emails. Targets must
                    already be assigned. Can only be done once.
                  </div>
                </div>
                <button
                  className={`transition text-base font-bold py-2 px-4 mt-3 ${
                    game.isActive
                      ? 'bg-green-600 opacity-40'
                      : 'bg-green-600 hover:bg-green-600/80'
                  }`}
                  disabled={game.isActive}
                >
                  {game.isActive ? 'Game Already Started' : 'Start Game'}
                </button>
              </div>
            </GameCard>
            <GameCard
              className="bg-red-600/10"
              from="Shuffle Targets"
              fromColor="text-red-500"
            >
              <div>
                <div>
                  <div className="text-xl font-bold">Shuffle Targets</div>
                  <div className="text-sm mt-1">
                    Randomly assigns a new target to every participant. Can be
                    run at any time to shuffle participants during the game, but
                    will not send out target update emails.
                  </div>
                </div>
                <button
                  className={`transition text-base font-bold py-2 px-4 mt-3 bg-red-600 hover:bg-red-600/80`}
                  disabled={game.isActive}
                >
                  Shuffle Targets
                </button>
              </div>
            </GameCard>
            <GameCard
              className="bg-red-600/10"
              from="Email Targets"
              fromColor="text-red-500"
            >
              <div>
                <div>
                  <div className="text-xl font-bold">Email Targets</div>
                  <div className="text-sm mt-1">
                    Emails all participants their current target. DO NOT PRESS
                    after game start, only run when shuffling targets.
                  </div>
                </div>
                <button
                  className={`transition text-base font-bold py-2 px-4 mt-3 bg-red-600 hover:bg-red-600/80`}
                  disabled={game.isActive}
                >
                  Email Targets
                </button>
              </div>
            </GameCard>
          </div>
        )}
        {configPage === 'participants' && (
          <div>
            <div>
              <GameCard
                className="bg-blue-600/10"
                from="Copy Emails"
                fromColor="text-blue-500"
              >
                <div>
                  <div>
                    <div className="text-xl font-bold">Copy Emails</div>
                    <div className="text-sm mt-1">
                      Use the buttons below to copy participant emails in a
                      random order.
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <button
                      className={`transition text-base font-bold py-2 px-4 mt-3 bg-blue-600 hover:bg-blue-600/80`}
                    >
                      Copy All Emails
                    </button>
                    <button
                      className={`transition text-base font-bold py-2 px-4 mt-3 bg-blue-600 hover:bg-blue-600/80`}
                    >
                      Copy Alive Emails
                    </button>
                    <button
                      className={`transition text-base font-bold py-2 px-4 mt-3 bg-blue-600 hover:bg-blue-600/80`}
                    >
                      Copy Eliminated Emails
                    </button>
                  </div>
                </div>
              </GameCard>
              <div className="font-bold text-xl mt-4">
                Alive Participants (
                {game.participants.filter((p) => p.isAlive).length})
              </div>
              <ParticipantTable
                participants={game.participants.filter((p) => p.isAlive)}
                type="alive"
                className="mt-4"
              />
            </div>
            <div className="mt-8">
              <div className="font-bold text-xl">
                Eliminated Participants (
                {game.participants.filter((p) => !p.isAlive).length})
              </div>
              <ParticipantTable
                participants={game.participants.filter((p) => !p.isAlive)}
                type="eliminated"
                className="mt-4"
              />
            </div>
          </div>
        )}
        {configPage === 'log' && (
          <div>
            <ActionLogTable logs={game.actionLogs} game={game} />
          </div>
        )}
        {configPage === 'stats' && <div>Statistics</div>}
      </div>
    </div>
  );
}

export const logIcons = {
  [ActionLogType.ELIMINATE]: '❌',
  [ActionLogType.EMAIL]: '✉️',
  [ActionLogType.MESSAGE]: '💬',
  [ActionLogType.SHUFFLE]: '🔀',
  [ActionLogType.START]: '🚀',
};

export function getLogMessage(
  log: ActionLogWithEverything,
  game: GameWithEverything
) {
  const participant = game.participants.find((p) => p.id === log.participantId);
  const target = game.participants.find((p) => p.id === log.targetId);

  switch (log.type) {
    case ActionLogType.ELIMINATE:
      return `${participant?.user.firstName} ${participant?.user.lastName} eliminated ${target?.user.firstName} ${target?.user.lastName}`;
    case ActionLogType.EMAIL:
      return `${log.user?.firstName} ${log.user?.lastName} sent out emails to all participants`;
    case ActionLogType.MESSAGE:
      return log.message;
    case ActionLogType.SHUFFLE:
      return `${log.user?.firstName} ${log.user?.lastName} shuffled all targets`;
    case ActionLogType.START:
      return `${log.user?.firstName} ${log.user?.lastName} started the game`;
  }
}

export function ActionLogTable({
  logs,
  game,
  className,
}: {
  logs: ActionLogWithEverything[];
  game: GameWithEverything;
  className?: string;
}) {
  return (
    <div className={`relative overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Time
            </th>
            <th scope="col" className="px-6 py-3">
              Message
            </th>
          </tr>
        </thead>
        <tbody>
          {logs
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((log) => (
              <tr
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                key={log.id}
              >
                <td scope="row" className="px-6 py-4">
                  {log.timestamp.toDateString()}{' '}
                  {log.timestamp.toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {logIcons[log.type]} {getLogMessage(log, game)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function ParticipantTable({
  participants,
  type,
  className,
}: {
  participants: ParticipantsWithEverything[];
  type: 'alive' | 'eliminated';
  className?: string;
}) {
  return (
    <div className={`relative overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Img
            </th>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              {type === 'alive' ? 'Target' : 'Eliminated By'}
            </th>
            <th scope="col" className="px-6 py-3">
              Eliminations
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              key={participant.id}
            >
              <td className="px-4 py-2">
                <Image
                  src="/thijs.jpg"
                  width={256}
                  height={256}
                  alt="Photo of target"
                  className="w-10 h-10"
                />
              </td>
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {participant.user.firstName} {participant.user.lastName}
              </th>
              <td className="px-6 py-4">
                {type === 'alive'
                  ? `${participant.target?.user.firstName} ${participant.target?.user.lastName}`
                  : `${participant.eliminatedBy?.user.firstName} ${participant.eliminatedBy?.user.lastName}`}
              </td>
              <td className="px-6 py-4">
                {participant.eliminatedTargets.length}
              </td>
              <td className="px-6 py-4 flex flex-row gap-2 text-xs">
                {type === 'alive' ? (
                  <button className="font-bold text-red-600">Eliminate</button>
                ) : (
                  <button className="font-bold text-green-600">Revive</button>
                )}
                <button className="font-bold text-blue-600">Email</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}