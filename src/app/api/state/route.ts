import { getGameState } from "@/lib/gameState";
import { NextResponse } from "next/server";

export async function GET() {
  const state = getGameState();  
  // { size:10, shots: { player1: Shot[], player2: Shot[] }, sunkShips: { player1: string[], player2: string[] } }
  return NextResponse.json(state);
}
