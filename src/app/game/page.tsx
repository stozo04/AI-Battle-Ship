'use client';

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getSunkShips, isFleetSunkByShots } from "@/lib/gameUtils";
import { Coord, Ship, Shot, FLEET, Player } from "@/lib/types";

function GameContent() {
    const searchParams = useSearchParams();
    const player1 = searchParams.get("player1");
    const player2 = searchParams.get("player2");
    
    const [currentTurn, setCurrentTurn] = useState<"player1" | "player2">("player1");
    const [player1Shots, setPlayer1Shots] = useState<Shot[]>([]);
    const [player2Shots, setPlayer2Shots] = useState<Shot[]>([]);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [player1Board, setPlayer1Board] = useState<Ship[]>([]);
    const [player2Board, setPlayer2Board] = useState<Ship[]>([]);
    const [player1Ready, setPlayer1Ready] = useState(false);
    const [player2Ready, setPlayer2Ready] = useState(false);
    const allShipsPlaced = player1Ready && player2Ready;
    const [isGameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [turnCount, setTurnCount] = useState(0);
    const [isShotInProgress, setIsShotInProgress] = useState(false);

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

    const fireNextShot = async () => {
        if (!gameStarted || isGameOver || isShotInProgress) return;
      
        try {
          setIsShotInProgress(true);
          setTurnCount(count => count + 1);
          const isPlayer1      = currentTurn === "player1";
          const shooterShots   = isPlayer1 ? player1Shots  : player2Shots;
          const opponentBoard  = isPlayer1 ? player2Board  : player1Board;
      
          // 1) Prepare variables
          let shot: Coord;
          let aiReason: string;
      
          // 2) Decide shot source
          if (isPlayer1) {
            shot     = getRandomShot(shooterShots);
            aiReason = "Random shot";
          } else {
            try {
              const sunk   = getSunkShips(opponentBoard, shooterShots);
              const aiResp = await getAiShot(currentTurn, shooterShots, sunk);
              shot         = aiResp.nextShot;
              aiReason     = aiResp.reason;
            } catch (err) {
              console.error(err);
              setLastResult("Error fetching AI move. Check console.");
              return;
            }
          }
      
          // 3) Compute hit/miss
          const isHit   = opponentBoard.some(ship =>
            ship.coordinates.some(c => c.row === shot.row && c.col === shot.col)
          );
          const result: "hit" | "miss" = isHit ? "hit" : "miss";
      
          // 4) Build and record the shot
          const newShot  = { row: shot.row, col: shot.col, result } as Shot;
          const newShots = [...shooterShots, newShot];
      
          if (isPlayer1) {
            setPlayer1Shots(newShots);
          } else {
            setPlayer2Shots(newShots);
          }
      
          // 5) Win check
          if (result === "hit" && isFleetSunkByShots(opponentBoard, newShots)) {
            setGameOver(true);
            setWinner(currentTurn);
            setLastResult(`${currentTurn} wins! 🎉`);

            // 2️⃣ Persist to leaderboard
            fetch("/api/record-result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                player1,
                player2,
                winner: currentTurn,
                turns: turnCount
                })
            })
                .then(res => res.json())
                .then(json => {
                if (!json.success) console.error("Record failed:", json.error);
                else console.log("Game recorded:", json.record);
                })
                .catch(err => console.error("Record‐result error:", err));
            return;
          }
      
          // 6) Show what happened + AI reasoning
          setLastResult(
            `${isPlayer1 ? player1 : player2} fired at (${shot.row}, ${shot.col}) and ${result}.` +
            ` AI thought: "${aiReason}"`
          );
      
          // 7) Swap turns
          setCurrentTurn(isPlayer1 ? "player2" : "player1");
        } catch (err) {
          console.error(err);
          setLastResult("Error firing shot. Check console.");
        } finally {
          setIsShotInProgress(false);
        }
    };
      
    const handlePlaceShips = (player: Player) => {
        if (player === "player1") {
            // Generate a random board for player 1
            const board = placeShipsRandomly();
            // Tell React to update the player 1 board and render the UI
            setPlayer1Board(board);
            // flips the "ready" flag so UI shows "Ships placed ✔"
            setPlayer1Ready(true);
        } else {
            // Generate a random board for player 2
            const board = placeShipsRandomly();
            // Tell React to update the player 2 board and render the UI
            setPlayer2Board(board);
            // flips the "ready" flag so UI shows "Ships placed ✔"
            setPlayer2Ready(true);
        }
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

    async function getAiShot(
        player: Player,
        shots: Shot[],
        sunkShips: string[],
      ) {
        const res = await fetch("/api/next-shot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player, shots, sunkShips }),
        });
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<{ nextShot: Coord; reason: string }>;
      }
      
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
                            onClick={fireNextShot}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isShotInProgress}
                        >
                            {isShotInProgress ? "Processing..." : "Next Turn"}
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

export default function GamePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GameContent />
        </Suspense>
    );
}
