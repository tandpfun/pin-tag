import Image from 'next/image';
import { userAuth } from '../lib/auth/hooks';
import { useJoinableGames } from '@/lib/game/hooks';
import Link from 'next/link';

export default async function Home() {
  const user = await userAuth();

  return (
    <div className="w-screen h-screen flex justify-center items-center text-center px-4">
      <div>
        <h1 className="font-bold text-6xl sm:text-9xl border-2 px-2 border-green-600 w-fit mx-auto">
          PINTAG
        </h1>
        <div className="mt-8">
          {user !== null ? (
            user.activeGameId !== null ? (
              <div>
                <div>Welcome back, {user.firstName}.</div>
                <Link
                  href={`/game/${user.activeGameId}`}
                  className="inline-block bg-green-600/10 text-green-600 px-5 py-2 mt-4 hover:bg-green-600/20 transition border-2 border-green-600"
                >
                  Continue to Game
                </Link>
              </div>
            ) : (
              <div>
                <div>
                  Hi {user.firstName}! The game hasn&apos;t started yet.
                  <br />
                  You&apos;ll get an email when your target has been assigned!
                </div>
              </div>
            )
          ) : (
            <div className="max-w-2xl">
              <div className="font-bold">
                Welcome to Lick-Wilmerding High School&apos;s annual pin tag
                game!
              </div>
              <div className="mt-2">
                Click the &quot;mission portal&quot; button in any email from
                the game to log in to your mission portal.
              </div>
            </div>
          )}
        </div>
        <div className="mt-48">
          Designed and developed by Thijs Simonian &apos;24
        </div>
        <div className="mt-2 text-gray-300 text-sm">
          Email pintag2024@gmail.com for help.
        </div>
      </div>
    </div>
  );
}
