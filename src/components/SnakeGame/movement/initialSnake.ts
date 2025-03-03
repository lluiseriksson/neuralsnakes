
import { Position } from "../types";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  // Create initial snake with three segments in vertical orientation
  // The head is at position (x,y), and the body extends downward
  return [
    { x, y },       // Head
    { x, y: y + 1 }, // First body segment
    { x, y: y + 2 }  // Second body segment (tail)
  ];
};
