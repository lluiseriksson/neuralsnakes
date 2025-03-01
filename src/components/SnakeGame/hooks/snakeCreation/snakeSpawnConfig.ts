
import { Direction } from '../../types';

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const colors = ['yellow', 'blue', 'green', '#9b87f5'];
  
  return [positions[snakeId][0], positions[snakeId][1], directions[snakeId], colors[snakeId]];
};
