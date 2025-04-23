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
You are a Battleship‐playing agent.
Board size: 10×10 (rows/cols 0–9).
You know only your own shots and results:

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
    model: "gpt-4",
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
