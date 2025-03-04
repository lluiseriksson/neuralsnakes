
import { Position, Snake, GameState } from "../types";

// Function to detect if a move would result in immediate collision
export const wouldCollide = (newHead: Position, snake: Snake, gameState: GameState): boolean => {
  // Safety check for invalid positions
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Snake ${snake.id} has invalid positions in collision check`);
    return false;
  }
  
  // Check collision with self (excluding the tail which will move)
  // Only check segments that won't move (all except the last one)
  for (let i = 0; i < snake.positions.length - 1; i++) {
    if (newHead.x === snake.positions[i].x && newHead.y === snake.positions[i].y) {
      console.log(`Detected potential self-collision for snake ${snake.id} at (${newHead.x},${newHead.y})`);
      return true;
    }
  }
  
  // Check collision with other snakes
  for (const otherSnake of gameState.snakes) {
    // Skip invalid snakes, the current snake, or dead snakes
    if (!otherSnake.positions || otherSnake.positions.length === 0 || 
        otherSnake.id === snake.id || !otherSnake.alive) {
      continue;
    }
    
    // Check all segments of other snakes
    for (const segment of otherSnake.positions) {
      if (newHead.x === segment.x && newHead.y === segment.y) {
        console.log(`Detected potential collision between snake ${snake.id} and snake ${otherSnake.id} at (${newHead.x},${newHead.y})`);
        return true;
      }
    }
  }
  
  // Check boundary collisions if the grid size is defined
  if (gameState.gridSize) {
    // Make sure to validate against a proper boundary
    if (newHead.x < 0 || newHead.x >= gameState.gridSize || 
        newHead.y < 0 || newHead.y >= gameState.gridSize) {
      console.log(`Detected boundary collision for snake ${snake.id} at (${newHead.x},${newHead.y})`);
      return true;
    }
  }
  
  return false;
};
