'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GamePage() {
  const searchParams = useSearchParams();
  const player1 = searchParams.get("player1");
  const player2 = searchParams.get("player2");

  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);

  const handlePlaceShips = (player: "player1" | "player2") => {
    if (player === "player1") {
      setPlayer1Ready(true);
    } else {
      setPlayer2Ready(true);
    }
  };

  const allShipsPlaced = player1Ready && player2Ready;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6">⚔️ AI Battleship Game</h1>

        <div className="flex flex-col md:flex-row justify-center items-start gap-12">
          {/* Player 1 Board */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{player1}</h2>
            <div className="grid grid-cols-10 gap-px bg-gray-700 mb-4">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-800 border border-gray-900"
                />
              ))}
            </div>
            {!player1Ready ? (
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  Set Ships Manually (Coming Soon)
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handlePlaceShips("player1")}
                >
                  Auto-Place Ships (AI)
                </Button>
              </div>
            ) : (
              <p className="text-green-400 mt-2">Ships placed ✔</p>
            )}
          </div>

          <div className="w-px bg-gray-600 h-full hidden md:block" />

          {/* Player 2 Board */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{player2}</h2>
            <div className="grid grid-cols-10 gap-px bg-gray-700 mb-4">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-800 border border-gray-900"
                />
              ))}
            </div>
            {!player2Ready ? (
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  Set Ships Manually (Coming Soon)
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handlePlaceShips("player2")}
                >
                  Auto-Place Ships (AI)
                </Button>
              </div>
            ) : (
              <p className="text-green-400 mt-2">Ships placed ✔</p>
            )}
          </div>
        </div>

        {allShipsPlaced && (
          <div className="mt-8">
            <Button disabled className="w-64 bg-green-600 hover:bg-green-700">
              Begin Battle (TODO)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
