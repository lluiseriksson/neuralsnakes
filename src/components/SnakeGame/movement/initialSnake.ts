
import { Position } from "../types";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  // Create initial snake with three segments
  return [
    { x, y },
    { x, y: y + 1 },
    { x, y: y + 2 }
  ];
};
