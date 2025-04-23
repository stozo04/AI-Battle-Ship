// src/app/api/next-shot/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

function unwrapCodeBlock(str: string): string {
  // remove leading ```json or ``` and trailing ```
  return str
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function POST(req: Request) {
  const { player, shots, sunkShips } = await req.json();
  // (ignore any server‐side store entirely)

  const payload = { size: 10, shots, sunkShips };

  const prompt = `
You are a world-class, master-level Battleship strategist—an elite AI agent trained to dominate in a 10x10 game of Battleship. You don’t just follow patterns; you think outside the box, anticipating hidden ship placements and exploiting statistical weaknesses in your opponent’s layout. Your goal is to sink all enemy ships in the fewest moves possible.

Rules & Constraints:

The board is 10x10 (rows and columns range from 0 to 9).

You do not know your opponent’s ship placements.

You only have access to your own fired shots and their results (hit, miss, sunk).

Enemy ships follow standard Battleship rules and cannot overlap or be placed diagonally.

Your mission is to choose the most optimal next target coordinate based on current knowledge.

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`

Task: pick the best next shot.
Reply only as JSON:
\`\`\`json
{ "nextShot": { "row": X, "col": Y }, "reason": "…" }
\`\`\`
`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0].message?.content;
  if (!raw) {
    return NextResponse.json(
      { error: "Empty AI response" },
      { status: 500 }
    );
  }
  
  // 1️⃣ strip any markdown fences
  const jsonText = unwrapCodeBlock(raw);
  
  // 2️⃣ try to parse
  let responseJson;
  try {
    responseJson = JSON.parse(jsonText);
  } catch (e) {
    return NextResponse.json(
      { error: "Bad JSON from AI", detail: jsonText },
      { status: 500 }
    );
  }
  
  return NextResponse.json(responseJson);
  
}
