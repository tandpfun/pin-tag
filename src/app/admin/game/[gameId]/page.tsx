import { userAuth } from '@/lib/auth/hooks';
import { Role } from '@prisma/client';
import React, { useState } from 'react';
import { redirect } from 'next/navigation';
import { getGame, getGameList } from '@/lib/game/hooks';
import Link from 'next/link';
import ParticipantChart from './ParticipantChart';
import AdminConfig from './AdminConfig';

export default async function AdminGamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const user = await userAuth();
  if (user?.role !== Role.ADMIN) return redirect('/');

  const game = await getGame(params.gameId);
  if (!game) return redirect('/');

  return (
    <div className="w-screen justify-center flex">
      <div className="max-w-5xl w-full mt-4 sm:mt-12 px-4">
        <div>
          <Link href="/admin" className="text-red-500">
            &lt;- Admin Portal
          </Link>
          <h1 className="text-3xl sm:text-5xl font-bold mt-4">{game.name}</h1>
          <div className="mt-2 sm:mt-4">
            {game.participants.filter((p) => p.isAlive).length}/
            {game.participants.length} participants remain.
          </div>
        </div>
        <div className="flex flex-row">
          <AdminConfig game={game} />
        </div>
      </div>
    </div>
  );
}
