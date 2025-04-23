// src/lib/types.ts
export type Shot = { row: number; col:   number; result: "hit" | "miss" }
export type Ship = { name: string; coordinates: Coord[] }
export type Coord = { row: number; col: number };
export type Player = "player1" | "player2";
export type Fleet = [
    { name: "Carrier", size: 5 },
    { name: "Battleship", size: 4 },
    { name: "Cruiser", size: 3 },
    { name: "Submarine", size: 3 },
    { name: "Destroyer", size: 2 },
];

export const FLEET: Fleet = [
    { name: "Carrier", size: 5 },
    { name: "Battleship", size: 4 },
    { name: "Cruiser", size: 3 },
    { name: "Submarine", size: 3 },
    { name: "Destroyer", size: 2 },
];

export  interface GameRecord {
    id: string;             // unique identifier (e.g. UUID)
    player1: string;        // name of the first competitor
    player2: string;        // name of the second competitor
    winner: string;         // name of whoever won
    turns: number;          // how many “Next Turn” calls it took (rounds)
    playedAt: string;       // ISO timestamp of when the game ended
  }
  