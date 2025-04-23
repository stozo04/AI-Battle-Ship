// src/app/leaderboard/page.tsx

import React from "react";
import leaderboardData from "@/data/leaderboard.json";
import { GameRecord } from "@/lib/types";

interface LeaderboardEntry {
  player: string;
  wins: number;
  losses: number;
  avgRounds: number;
}

export default function LeaderboardPage() {
  const records: GameRecord[] = leaderboardData;

  // Aggregate per player
  const stats: Record<
    string,
    { wins: number; losses: number; turnsSum: number; games: number }
  > = {};

  records.forEach((rec) => {
    [rec.player1, rec.player2].forEach((player) => {
      if (!stats[player]) {
        stats[player] = { wins: 0, losses: 0, turnsSum: 0, games: 0 };
      }
      stats[player].games += 1;
      stats[player].turnsSum += rec.turns;
      if (rec.winner === player) stats[player].wins += 1;
      else stats[player].losses += 1;
    });
  });

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = Object.entries(stats).map(
    ([player, { wins, losses, turnsSum, games }]) => ({
      player,
      wins,
      losses,
      avgRounds: parseFloat((turnsSum / games).toFixed(2)),
    })
  );

  // Sort by wins desc, then avgRounds asc
  entries.sort((a, b) => b.wins - a.wins || a.avgRounds - b.avgRounds);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
      <div className="w-full max-w-2xl">
    <div>
    <h1 className="text-4xl text-center font-bold mb-6">🤖 Leaderboard</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Player</th>
            <th className="px-4 py-2">Wins</th>
            <th className="px-4 py-2">Losses</th>
            <th className="px-4 py-2">Avg Rounds</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.player} className="border-t">
              <td className="px-4 py-2 text-center">{i + 1}</td>
              <td className="px-4 py-2 text-center">{e.player}</td>
              <td className="px-4 py-2 text-center">{e.wins}</td>
              <td className="px-4 py-2 text-center">{e.losses}</td>
              <td className="px-4 py-2 text-center">{e.avgRounds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    </div>
  );
}
