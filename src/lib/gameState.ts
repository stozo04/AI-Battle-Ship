
import { getSunkShips } from "./gameUtils";
import { player1Board, player1Shots, player2Board, player2Shots } from "./yourStore";

export function getGameState() {
  return {
    size: 10,
    shots: {
      player1: player1Shots,  
      player2: player2Shots
    },
    sunkShips: {
      player1: getSunkShips(player1Board, player2Shots),
      player2: getSunkShips(player2Board, player1Shots)
    }
  };
}
