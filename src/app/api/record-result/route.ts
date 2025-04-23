import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { GameRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    // 1. Parse incoming data
    const { player1, player2, winner, turns } = await request.json();

    // 2. Build new record
    const newRecord: GameRecord = {
      id: crypto.randomUUID(),
      player1,
      player2,
      winner,
      turns,
      playedAt: new Date().toISOString(),
    };

    // 3. Locate the leaderboard file
    const filePath = path.join(process.cwd(), "src/data/leaderboard.json");

    // 4. Read existing records
    const fileContents = await fs.readFile(filePath, "utf8");
    const records: GameRecord[] = JSON.parse(fileContents || "[]");

    // 5. Append and write back
    records.push(newRecord);
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), "utf8");

    // 6. Return success
    return NextResponse.json({ success: true, record: newRecord });
  } catch (error: unknown) {
    console.error("Error recording game result:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
