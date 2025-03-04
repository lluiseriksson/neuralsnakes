
import { Direction, Snake } from '../../types';
import { GRID_SIZE } from '../../constants';
import { createFallbackBrain } from './createFallbackBrain';

export const createFallbackSnake = (id: number, spawnX: number, spawnY: number, direction: Direction, color: string): Snake => {
  const fallbackBrain = createFallbackBrain();

  return {
    id,
    positions: [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}],
    direction,
    color,
    score: 0,
    brain: fallbackBrain,
    alive: true,
    gridSize: GRID_SIZE,
    movesWithoutEating: 0,
    decisionMetrics: {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0
    },
    generation: 1, // Add generation
    age: 0 // Add age
  };
};
