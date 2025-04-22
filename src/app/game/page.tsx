'use client';

import { useSearchParams } from "next/navigation";

export default function GamePage() {
  const searchParams = useSearchParams();
  const player1 = searchParams.get("player1");
  const player2 = searchParams.get("player2");

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-4">⚔️ AI Battleship Game</h1>
        <p className="mb-2">Player 1: {player1}</p>
        <p className="mb-2">Player 2: {player2}</p>
        <p className="mt-6 text-gray-400">Game logic coming soon...</p>
      </div>
    </div>
  );
}
