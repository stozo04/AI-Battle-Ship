// src/lib/gameUtils.ts
import { Coord, Ship, Shot } from "./types";

/** 
 * Returns true if *every* ship cell appears in the shots list.
 */
export function isFleetSunkByShots(
    ships: Ship[],
    shots: Coord[]
  ): boolean {
    // For each ship...
    return ships.every(ship =>
      // ...every coordinate of that ship...
      ship.coordinates.every(coord =>
        // ...has been shot at least once
        shots.some(s =>
          s.row === coord.row && s.col === coord.col
        )
      )
    );
  }
  
  /** Returns names of ships whose every cell is in shots */
export function getSunkShips(
    ships: Ship[],
    shots: Shot[]
  ): string[] {
    return ships
      .filter(ship =>
        ship.coordinates.every(coord =>
          shots.some(s => s.row === coord.row && s.col === coord.col)
        )
      )
      .map(s => s.name);
  }
  
  