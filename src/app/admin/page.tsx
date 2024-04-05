import { userAuth } from '@/lib/auth/hooks';
import { Role } from '@prisma/client';
import React from 'react';
import { redirect } from 'next/navigation';
import { getGameList } from '@/lib/game/hooks';
import Link from 'next/link';

export default async function Admin() {
  const user = await userAuth();

  if (user?.role !== Role.ADMIN) return redirect('/');

  const games = await getGameList();

  return (
    <div className="w-screen justify-center flex">
      <div className="max-w-5xl w-full mt-4 sm:mt-12 px-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold">Pin-Tag Admin</h1>
          <div className="mt-2 sm:mt-4">Please select a game to manage.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-4">
          {games.map((game) => (
            <Link
              className="bg-blue-600/20 hover:bg-blue-600/10 transition h-48 col-span-1 w-full p-4"
              href={`/admin/game/${game.id}`}
              key={game.id}
            >
              <div className="text-xl font-bold text-blue-600">{game.name}</div>
              <div className="mt-2">
                <div>
                  {game.participants.filter((p) => p.isAlive).length}/
                  {game.participants.length} participants remaining.
                </div>
                <div>Game started: {game.isActive ? 'True' : 'False'}</div>
                <div>
                  Game is joinable: {game.isJoinable ? 'True' : 'False'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
