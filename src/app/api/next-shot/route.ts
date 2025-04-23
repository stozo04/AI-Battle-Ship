// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { getGameState } from "@/lib/gameState";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export async function POST(request: Request) {
//   const { player } = await request.json();  // "player1" or "player2"
//   const state = getGameState(); 
//   const payload = {
//     size: 10,
//     shots: state.shots[player],
//     sunkShips: state.sunkShips[player]
//   };

//   const prompt = `
// You are a Battleship-playing agent.  
// Board size: 10×10 (rows/cols 0–9).  
// You know only your own shots and results:

// \`\`\`json
// ${JSON.stringify(payload, null, 2)}
// \`\`\`

// Task: pick the best next shot.  
// Reply **only** as JSON:
// \`\`\`json
// { "nextShot": { "row": X, "col": Y }, "reason": "…" }
// \`\`\`
// `;

//   const chat = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [{ role: "user", content: prompt }]
//   });

//   // parse the assistant’s JSON
//   const response = JSON.parse(chat.choices[0].message.content);
//   return NextResponse.json(response);
// }
