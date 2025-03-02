
import { Direction } from '../../types';

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  // Using fixed positions for more predictable spawning
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  // More vibrant colors for better visibility
  const colors = ['#FFDD00', 'blue', 'green', '#9b87f5']; // Yellow color for first snake
  
  // Ensure snake ID is within bounds
  const safeId = Math.min(Math.max(0, snakeId), positions.length - 1);
  
  console.log(`Snake ${snakeId} will spawn at ${positions[safeId]} with direction ${directions[safeId]} and color ${colors[safeId]}`);
  
  return [positions[safeId][0], positions[safeId][1], directions[safeId], colors[safeId]];
};
