'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isFleetSunkByShots } from "@/lib/gameUtils";
import { Coord, Ship, Shot, FLEET } from "@/lib/types";

export default function GamePage() {

    const [currentTurn, setCurrentTurn] = useState<"player1" | "player2">("player1");
    const [player1Shots, setPlayer1Shots] = useState<Shot[]>([]);
    const [player2Shots, setPlayer2Shots] = useState<Shot[]>([]);
    const [lastResult, setLastResult] = useState<string | null>(null);


    const [gameStarted, setGameStarted] = useState(false);
    const searchParams = useSearchParams();
    const player1 = searchParams.get("player1");
    const player2 = searchParams.get("player2");
    

    const [player1Board, setPlayer1Board] = useState<Ship[]>([]);
    const [player2Board, setPlayer2Board] = useState<Ship[]>([]);

    const [player1Ready, setPlayer1Ready] = useState(false);
    const [player2Ready, setPlayer2Ready] = useState(false);
    const allShipsPlaced = player1Ready && player2Ready;
    const [isGameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    const getRandomShot = (shots: Coord[]): Coord => {
        const tried = new Set(shots.map(s => `${s.row},${s.col}`));
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const shot = { row: Math.floor(Math.random() * 10), col: Math.floor(Math.random() * 10) };
            const key = `${shot.row},${shot.col}`;
            if (!tried.has(key)) return shot;
            attempts++;
        }

        throw new Error("Unable to find valid shot.");
    };


    const fireNextShot = () => {
        if (!gameStarted) return;
      
        const isPlayer1 = currentTurn === "player1";
        const shooterShots = isPlayer1 ? player1Shots : player2Shots;
        const opponentBoard = isPlayer1 ? player2Board : player1Board;
      
        // 1) pick and record the shot locally
        const shot = getRandomShot(shooterShots);
        const newShots = [...shooterShots, shot];
      
        // 2) determine hit
        const isHit = opponentBoard.some(ship =>
          ship.coordinates.some(c => c.row === shot.row && c.col === shot.col)
        );
      
        const result = isHit ? "hit" : "miss";
        const newShot: Shot = { row: shot.row, col: shot.col, result };

        // 3) update state for shots
        if (isPlayer1) setPlayer1Shots(prev => [...prev, newShot]);
        else          setPlayer2Shots(prev => [...prev, newShot]);
      
        // 4) check for a win *including* this shot
        if (isHit && isFleetSunkByShots(opponentBoard, newShots)) {
          setGameOver(true);
          // declare the shooter as the winner
          setWinner(isPlayer1 ? player1 : player2);
          return;           // stop here—don't swap turns
        }
      
        // 5) no win? record result text and flip turns
        setLastResult(
          `${isPlayer1 ? player1 : player2} fired at (${shot.row}, ${shot.col}) and ${
            isHit ? "hit!" : "missed."
          }`
        );
        setCurrentTurn(isPlayer1 ? "player2" : "player1");
      };
      


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
                                const isShip = player1Board?.some(ship =>
                                    ship.coordinates.some(c => c.row === row && c.col === col)
                                );

                                const opponentShots = player2Shots;
                                const wasShot = opponentShots.some(s => s.row === row && s.col === col);
                                const wasHit = wasShot && isShip;

                                let cellColor = "bg-gray-800"; // default

                                if (wasShot && wasHit) cellColor = "bg-red-600";     // HIT 🔴
                                else if (wasShot && !wasHit) cellColor = "bg-gray-300"; // MISS ⚪
                                else if (isShip) cellColor = "bg-blue-600";           // SHIP 🔵

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square border border-gray-900 ${cellColor}`}
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
                                const isShip = player2Board?.some(ship =>
                                    ship.coordinates.some(c => c.row === row && c.col === col)
                                );

                                const opponentShots = player1Shots;
                                const wasShot = opponentShots.some(s => s.row === row && s.col === col);
                                const wasHit = wasShot && isShip;

                                let cellColor = "bg-gray-800"; // default

                                if (wasShot && wasHit) cellColor = "bg-red-600";     // HIT 🔴
                                else if (wasShot && !wasHit) cellColor = "bg-gray-300"; // MISS ⚪
                                else if (isShip) cellColor = "bg-blue-600";           // SHIP 🔵

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square border border-gray-900 ${cellColor}`}
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

                {gameStarted && !isGameOver && (
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-xl font-semibold">
                            {currentTurn === "player1" ? player1 : player2}&apos;s Turn
                        </p>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={fireNextShot}
                        >
                            Next Turn
                        </Button>
                        {lastResult && <p className="text-lg text-gray-300">{lastResult}</p>}
                    </div>
                )}

                {isGameOver && (
                <div className="p-4 bg-green-100 rounded">
                    <span className="text-xl font-semibold">🎉 Player {winner} wins! All ships sunk.</span>
                </div>
                )}
            </div>
        </div>
    );
}
