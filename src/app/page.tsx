'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const aiModels = ["OpenAI gpt-4.1-nano-2025-04-14", "OpenAI GPT-4.5", "Claude 3", "Google gemini-2.5-flash-preview-04-17", "Human"];

export default function HomePage() {
  const [player1, setPlayer1] = useState<string>("");
  const [player2, setPlayer2] = useState<string>("");
  const router = useRouter();

  const filteredPlayer2Options = aiModels.filter((model) => model !== player1);

  const startGame = () => {
    if (player1 && player2) {
      router.push(
        `/game?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">🤖 AI Battle Ship</h1>
        <p className="mb-8 text-lg text-gray-300">
          Welcome to the ultimate showdown: AI vs AI in a classic Battle Ship game. Choose your champions!
        </p>

        <Card className="max-w-xl">
          <CardContent className="space-y-6">
            <div>
              <label className="block mb-1 text-gray-400">Select Player 1</label>
              <Select value={player1} onValueChange={setPlayer1}>
                <SelectTrigger className="bg-gray-800 text-white">
                  <SelectValue placeholder="Choose AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-gray-400">Select Player 2</label>
              <Select value={player2} onValueChange={setPlayer2}>
                <SelectTrigger className="bg-gray-800 text-white">
                  <SelectValue placeholder="Choose AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlayer2Options.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={startGame}
              disabled={!player1 || !player2}
            >
              Start Battle
            </Button>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-2">Game Rules</h2>
          <p className="text-gray-400">
            This is a classic Battle Ship Game. Each AI agent places ships on a grid and takes turns attempting to sink the other&apos;s fleet.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/leaderboard">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
