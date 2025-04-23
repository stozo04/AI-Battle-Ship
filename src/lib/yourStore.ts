// src/lib/yourStore.ts

import type { Ship, Shot } from "./types";

// ——— In-memory state ———
export let player1BoardStore:   Ship[] = [];
export let player2BoardStore:   Ship[] = [];
export let player1ShotsStore:  Shot[] = [];
export let player2ShotsStore:  Shot[] = [];

// helper setters if you prefer functions over direct assignment:
export function setPlayer1StoreBoard(b: Ship[])  { player1BoardStore = b }
export function setPlayer2StoreBoard(b: Ship[])  { player2BoardStore = b }
export function setStorePlayer1Shots(s: Shot[]) { player1ShotsStore = s }
export function setStorePlayer2Shots(s: Shot[]) { player2ShotsStore = s }
