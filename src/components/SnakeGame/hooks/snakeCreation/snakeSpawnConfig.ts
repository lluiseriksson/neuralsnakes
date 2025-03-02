
import { Direction } from '../../types';

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const colors = ['#F9D923', 'blue', 'green', '#9b87f5']; // Changed to brighter yellow for better visibility
  
  // Ensure snake ID is within bounds
  const safeId = Math.min(Math.max(0, snakeId), positions.length - 1);
  
  return [positions[safeId][0], positions[safeId][1], directions[safeId], colors[safeId]];
};
