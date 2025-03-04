
import { Position, Snake, GameState } from "../types";

// Function to detect if a move would result in immediate collision
export const wouldCollide = (newHead: Position, snake: Snake, gameState: GameState): boolean => {
  // Safety check for invalid positions
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Snake ${snake.id} has invalid positions in collision check`);
    return false;
  }
  
  // Check collision with self (excluding the tail which will move)
  for (let i = 0; i < snake.positions.length - 1; i++) {
    if (newHead.x === snake.positions[i].x && newHead.y === snake.positions[i].y) {
      return true;
    }
  }
  
  // Check collision with other snakes
  for (const otherSnake of gameState.snakes) {
    if (!otherSnake.positions || otherSnake.positions.length === 0) {
      continue; // Skip invalid snakes
    }
    
    if (otherSnake.id === snake.id || !otherSnake.alive) continue;
    
    for (const segment of otherSnake.positions) {
      if (newHead.x === segment.x && newHead.y === segment.y) {
        return true;
      }
    }
  }
  
  return false;
};
