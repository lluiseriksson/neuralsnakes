
import { Position, Apple } from '../../types';
import { GRID_SIZE } from '../../constants';

export const detectNearbyApples = (
  head: Position,
  apples: Apple[],
  gridSize: number = GRID_SIZE
): number[] => {
  // Initialize directional arrays (UP, RIGHT, DOWN, LEFT)
  const directions = [0, 0, 0, 0];
  
  // If no apples, return zero signals
  if (!apples || apples.length === 0) {
    return directions;
  }
  
  // Find the closest apple
  let closestApple: Apple | null = null;
  let minDistance = Infinity;
  
  for (const apple of apples) {
    // Calculate distance
    const dx = Math.min(
      Math.abs(apple.position.x - head.x),
      gridSize - Math.abs(apple.position.x - head.x)
    );
    const dy = Math.min(
      Math.abs(apple.position.y - head.y),
      gridSize - Math.abs(apple.position.y - head.y)
    );
    const distance = dx + dy; // Manhattan distance
    
    if (distance < minDistance) {
      minDistance = distance;
      closestApple = apple;
    }
  }
  
  if (!closestApple) return directions;
  
  // Adjust to wrap-around grid (toroidal grid)
  // Check if it's closer to wrap around the grid
  const dx = closestApple.position.x - head.x;
  const dy = closestApple.position.y - head.y;
  
  // Adjust for wrap-around
  const wrapDx = dx > gridSize / 2 ? dx - gridSize : dx < -gridSize / 2 ? dx + gridSize : dx;
  const wrapDy = dy > gridSize / 2 ? dy - gridSize : dy < -gridSize / 2 ? dy + gridSize : dy;
  
  // Set direction signals based on relative position
  // UP
  if (wrapDy < 0) {
    directions[0] = Math.min(1.0, 1.0 / (Math.abs(wrapDy) + 0.1));
  }
  // RIGHT
  if (wrapDx > 0) {
    directions[1] = Math.min(1.0, 1.0 / (Math.abs(wrapDx) + 0.1));
  }
  // DOWN
  if (wrapDy > 0) {
    directions[2] = Math.min(1.0, 1.0 / (Math.abs(wrapDy) + 0.1));
  }
  // LEFT
  if (wrapDx < 0) {
    directions[3] = Math.min(1.0, 1.0 / (Math.abs(wrapDx) + 0.1));
  }
  
  return directions;
};

export const isAppleAdjacent = (head: Position, apple: Apple): boolean => {
  // Check if an apple is in an adjacent cell (including diagonals)
  const dx = Math.abs(head.x - apple.position.x);
  const dy = Math.abs(head.y - apple.position.y);
  
  // Handle grid wrap-around
  const wrappedDx = Math.min(dx, GRID_SIZE - dx);
  const wrappedDy = Math.min(dy, GRID_SIZE - dy);
  
  // Adjacent if either x or y is 1 and the other is 0
  return (wrappedDx <= 1 && wrappedDy <= 1);
};
