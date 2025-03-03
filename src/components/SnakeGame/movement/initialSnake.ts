
import { Position } from "../types";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  // Create initial snake with three segments in vertical orientation
  // The head is at position (x,y), and the body extends downward
  
  // Random orientation to prevent "only straight" behavior
  const orientation = Math.floor(Math.random() * 4); // 0: vertical, 1: horizontal, 2: diagonal1, 3: diagonal2
  
  switch (orientation) {
    case 0: // Vertical (original)
      return [
        { x, y },                // Head
        { x, y: y + 1 },         // First body segment
        { x, y: y + 2 }          // Second body segment (tail)
      ];
    case 1: // Horizontal
      return [
        { x, y },                // Head
        { x: x + 1, y },         // First body segment
        { x: x + 2, y }          // Second body segment (tail)
      ];
    case 2: // Diagonal 1
      return [
        { x, y },                // Head
        { x: x + 1, y: y + 1 },  // First body segment
        { x: x + 2, y: y + 2 }   // Second body segment (tail)
      ];
    case 3: // Diagonal 2
      return [
        { x, y },                // Head
        { x: x - 1, y: y + 1 },  // First body segment
        { x: x - 2, y: y + 2 }   // Second body segment (tail)
      ];
    default: // Fallback to vertical
      return [
        { x, y },                // Head
        { x, y: y + 1 },         // First body segment
        { x, y: y + 2 }          // Second body segment (tail)
      ];
  }
};
