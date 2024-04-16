'use client';

import { getAvatarUrl, gradYearToGrade } from '@/lib/game/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import {
  faCircleNotch,
  faSpinner,
  faWarning,
  faX,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { eliminateTarget, requestElimination } from '@/lib/game/actions';

import { useRouter } from 'next/navigation';
import GameCard from './GameCard';

export default function TargetCard({
  gameId,
  targetId,
  firstName,
  lastName,
  avatar,
  gradYear,
  eliminationCount,
}: {
  gameId: string;
  targetId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  gradYear?: number;
  eliminationCount?: number;
}) {
  const [showElimModal, setShowElimModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [rulesChecked, setRulesChecked] = React.useState(false);
  const [agreedChecked, setAgreedChecked] = React.useState(false);

  const showBlackOverlay =
    showElimModal || showSuccessModal || showLoader || error;

  const router = useRouter();

  async function showEliminationModal() {
    if (targetId == null) return;
    if (showElimModal || showLoader) return;

    setShowLoader(true);

    const testElimination = await requestElimination({
      gameId,
      targetId,
    }).catch((_) => null);
    if (testElimination?.error != null) {
      setError(testElimination?.error || 'Unknown error');
      setShowLoader(false);
      return;
    }

    setShowLoader(false);
    setError(null);
    setShowElimModal(true);
  }

  async function eliminate() {
    if (targetId == null) return;
    if (!showElimModal || showLoader) return;

    setShowLoader(true);

    const eliminateTgt = await eliminateTarget({ gameId, targetId }).catch(
      (_) => null
    );
    if (eliminateTgt == null || eliminateTgt?.error != null) {
      setError(eliminateTgt?.error || 'Unknown error');
      setShowLoader(false);
      return;
    }

    setShowElimModal(false);
    setShowLoader(false);
    setError(null);

    router.refresh(); // Only refreshes page with new data.
    setShowSuccessModal(true);
  }

  return (
    <div className="col-span-2">
      <GameCard
        className="bg-red-600/20"
        from="FBI Fileserver"
        fromColor="text-red-600"
      >
        <div className="flex gap-4">
          <div className="">
            <div className="w-24 h-24 sm:w-48 sm:h-48 relative">
              <Image
                src={getAvatarUrl(avatar) || '/empty_avatar.jpeg'}
                width={256}
                height={256}
                alt="Photo of target"
                className="filter w-full h-full"
              />
              <div className="w-full h-full absolute inset-0 bg-gradient-to-bl from-red-600/20 to-red-600/70" />
            </div>
          </div>
          <div className="text-sm sm:text-xl flex flex-col">
            <div className="font-bold text-lg sm:text-2xl sm:mb-2">
              YOUR TARGET
            </div>
            <div>
              <b>NAME:</b> {firstName} {lastName}
            </div>
            <div>
              <b>GRADE:</b> {gradYear != null && gradYearToGrade(gradYear)}
            </div>
            <div>
              <b>PINS:</b> {eliminationCount}
            </div>
            <div className="mt-auto text-base hidden sm:block">
              <button
                className="bg-red-600/10 text-red-600 px-5 py-2 mt-4 hover:bg-red-600/20 transition border-2 border-red-600"
                onClick={() => showEliminationModal()}
              >
                Mark as Eliminated
              </button>
            </div>
          </div>
        </div>
        <div className="mt-auto text-sm sm:text-base sm:hidden">
          <button
            className="bg-red-600/10 text-red-600 px-2 py-1.5 mt-4 hover:bg-red-600/20 transition border-2 border-red-600 w-full"
            onClick={() => showEliminationModal()}
          >
            Mark as Eliminated
          </button>
        </div>
      </GameCard>

      {/* Elimination Modal */}
      {showBlackOverlay && (
        <div
          className="w-screen h-screen fixed inset-0 bg-black/40 backdrop-blur-sm z-10"
          onClick={(e) =>
            e.target === e.currentTarget ? setShowElimModal(false) : null
          }
        >
          {error ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="max-w-3xl text-center">
                <div className="text-5xl">
                  <FontAwesomeIcon icon={faWarning} />
                </div>
                <div className="text-xl font-bold mt-4">{error}</div>
                <div className="text-lg mt-2">
                  Please click the link in your email and try again.
                </div>
              </div>
            </div>
          ) : showLoader ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="max-w-3xl text-center">
                <div className="text-5xl">
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="animate-spin"
                  />
                </div>
                <div className="text-lg mt-4">
                  This should only take a sec. Reload if this gets stuck.
                </div>
              </div>
            </div>
          ) : showElimModal ? (
            <div className="max-w-3xl w-full bg-black/90 mx-auto sm:mt-56 h-full sm:h-auto">
              <div className="w-full bg-red-500/30 p-6 relative h-full sm:h-auto">
                <div className="top-4 right-6 absolute text-xl">
                  <button onClick={() => setShowElimModal(false)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <div className="text-xl font-bold">Eliminate {firstName}?</div>
                <div className="bg-black/40 p-4 mt-4">
                  <div className="">
                    Almost there! Click the button below to mark {firstName} as
                    eliminated. Your pin must be mutually agreed upon and follow
                    all rules.
                  </div>
                  <div className="my-4">
                    <div>
                      <input
                        type="checkbox"
                        id="rules"
                        name="rules"
                        checked={rulesChecked}
                        onChange={(e) => setRulesChecked(e.target.checked)}
                      />
                      <label htmlFor="rules" className="ml-4">
                        I followed the game rules when pinning {firstName}
                      </label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="agreed"
                        name="agreed"
                        checked={agreedChecked}
                        onChange={(e) => setAgreedChecked(e.target.checked)}
                      />
                      <label htmlFor="agreed" className="ml-4">
                        {firstName} is aware and agrees that I pinned them
                      </label>
                    </div>
                  </div>
                  <div>
                    Accidental or falsified eliminations will result in your
                    elimination.
                  </div>
                </div>
                <div>
                  {!rulesChecked || !agreedChecked ? (
                    <div className="mt-4">
                      Check the boxes above to continue.
                    </div>
                  ) : (
                    <button
                      className="bg-black/40 text-red-600 px-5 py-2 mt-2 hover:bg-black/20 transition border-2 border-red-600"
                      onClick={() => eliminate()}
                    >
                      Eliminate {firstName}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : showSuccessModal ? (
            <div className="max-w-3xl w-full bg-black/90 mx-auto sm:mt-56 h-full sm:h-auto">
              <div className="w-full bg-green-500/30 p-6 relative h-full sm:h-auto">
                <div className="top-4 right-6 absolute text-xl">
                  <button onClick={() => setShowSuccessModal(false)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <div className="text-xl font-bold">Nice job, Agent!</div>
                <div className="bg-black/40 p-4 mt-4">
                  <div className="">
                    Congratulations, you successfully eliminated your target!
                    Your next target has been randomly assigned to you:{' '}
                    <span className="text-green-500">
                      {firstName} {lastName} &apos;
                      {gradYear?.toString().substring(2)}
                    </span>
                    . Best of luck, and keep your eyes peeled for anyone going
                    after you.
                  </div>
                  <div className="text-green-500 mt-4">- FBI Director Kim</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
