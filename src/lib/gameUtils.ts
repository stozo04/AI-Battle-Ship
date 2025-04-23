// src/lib/gameUtils.ts

export type Coord = { row: number; col: number };
export type Ship = { name: string; coordinates: Coord[] };

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
  
  
  