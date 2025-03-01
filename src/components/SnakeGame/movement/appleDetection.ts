
import { Position, Direction, GameState } from "../types";

// Function to determine if there's an apple in the chosen direction
export const isAppleInDirection = (head: Position, direction: Direction, gameState: GameState, gridSize: number): boolean => {
  let checkPos: Position;
  
  // Calculate the position to check based on the direction
  switch (direction) {
    case 'UP':
      checkPos = { x: head.x, y: (head.y - 1 + gridSize) % gridSize };
      break;
    case 'RIGHT':
      checkPos = { x: (head.x + 1) % gridSize, y: head.y };
      break;
    case 'DOWN':
      checkPos = { x: head.x, y: (head.y + 1) % gridSize };
      break;
    case 'LEFT':
      checkPos = { x: (head.x - 1 + gridSize) % gridSize, y: head.y };
      break;
  }
  
  // Check if there's an apple at the new position
  return gameState.apples.some(apple => 
    apple.position.x === checkPos.x && apple.position.y === checkPos.y
  );
};
