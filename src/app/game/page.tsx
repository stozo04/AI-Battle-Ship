'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GamePage() {

    const FLEET = [
        { name: "Carrier", size: 5 },
        { name: "Battleship", size: 4 },
        { name: "Cruiser", size: 3 },
        { name: "Submarine", size: 3 },
        { name: "Destroyer", size: 2 },
    ];

    const [gameStarted, setGameStarted] = useState(false);
    const searchParams = useSearchParams();
    const player1 = searchParams.get("player1");
    const player2 = searchParams.get("player2");

    type Coord = { row: number; col: number };
    type Ship = { name: string; coordinates: Coord[] };

    const [player1Board, setPlayer1Board] = useState<Ship[]>([]);
    const [player2Board, setPlayer2Board] = useState<Ship[]>([]);

    const [player1Ready, setPlayer1Ready] = useState(false);
    const [player2Ready, setPlayer2Ready] = useState(false);

    const placeShipsRandomly = (): Ship[] => {
        const board: boolean[][] = Array.from({ length: 10 }, () =>
            Array(10).fill(false)
        );
        const placedShips: Ship[] = [];

        for (const ship of FLEET) {
            let placed = false;

            while (!placed) {
                const isHorizontal = Math.random() < 0.5;
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);

                const coords: Coord[] = [];

                for (let i = 0; i < ship.size; i++) {
                    const r = row + (isHorizontal ? 0 : i);
                    const c = col + (isHorizontal ? i : 0);

                    if (r >= 10 || c >= 10 || board[r][c]) {
                        break;
                    }
                    coords.push({ row: r, col: c });
                }

                if (coords.length === ship.size) {
                    coords.forEach(({ row, col }) => (board[row][col] = true));
                    placedShips.push({ name: ship.name, coordinates: coords });
                    placed = true;
                }
            }
        }

        return placedShips;
    };

    const handlePlaceShips = (player: "player1" | "player2") => {
        if (player === "player1") {
            const board = placeShipsRandomly();
            setPlayer1Board(board);
            setPlayer1Ready(true);
        } else {
            const board = placeShipsRandomly();
            setPlayer2Board(board);
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
                            {Array.from({ length: 100 }).map((_, i) => {
                                const row = Math.floor(i / 10);
                                const col = i % 10;
                                const isShip =
                                    player1Board?.some((ship) =>
                                        ship.coordinates.some((c) => c.row === row && c.col === col)
                                    ) ?? false;

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square border border-gray-900 ${isShip ? "bg-blue-600" : "bg-gray-800"
                                            }`}
                                    />
                                );
                            })}
                        </div>

                        {!gameStarted && (
                            <>
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
                                    <div className="mt-2 space-y-2">
                                        <p className="text-green-400">Ships placed ✔</p>
                                        <Button
                                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                                            onClick={() => {
                                                const newBoard = placeShipsRandomly();
                                                setPlayer1Board(newBoard);
                                            }}
                                        >
                                            Re-Generate Ships
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="w-px bg-gray-600 h-full hidden md:block" />

                    {/* Player 2 Board */}
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2">{player2}</h2>
                        <div className="grid grid-cols-10 gap-px bg-gray-700 mb-4">
                            {Array.from({ length: 100 }).map((_, i) => {
                                const row = Math.floor(i / 10);
                                const col = i % 10;
                                const isShip =
                                    player2Board?.some((ship) =>
                                        ship.coordinates.some((c) => c.row === row && c.col === col)
                                    ) ?? false;

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square border border-gray-900 ${isShip ? "bg-blue-600" : "bg-gray-800"
                                            }`}
                                    />
                                );
                            })}
                        </div>

                        {!gameStarted && (
                            <>
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
                                    <div className="mt-2 space-y-2">
                                        <p className="text-green-400">Ships placed ✔</p>
                                        <Button
                                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                                            onClick={() => {
                                                const newBoard = placeShipsRandomly();
                                                setPlayer2Board(newBoard);
                                            }}
                                        >
                                            Re-Generate Ships
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {allShipsPlaced && !gameStarted && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            className="w-64 bg-green-600 hover:bg-green-700"
                            onClick={() => setGameStarted(true)}
                        >
                            Begin Battle
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}
