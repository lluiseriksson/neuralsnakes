
import { Direction, Snake } from '../types';
import { NeuralNetwork } from '../NeuralNetwork';
import { generateInitialSnake } from '../utils';

export const createSnake = (id: number, x: number, y: number, direction: Direction, color: string): Snake => ({
  id,
  positions: generateInitialSnake(x, y),
  direction,
  color,
  score: 0,
  brain: new NeuralNetwork(8, 12, 4),
  alive: true
});

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const colors = ['yellow', 'blue', 'green', '#9b87f5'];
  
  return [positions[snakeId][0], positions[snakeId][1], directions[snakeId], colors[snakeId]];
};
