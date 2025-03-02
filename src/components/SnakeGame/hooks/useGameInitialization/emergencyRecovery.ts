
import { GameState, Direction } from '../../types';
import { GRID_SIZE } from '../../constants';
import { generateApple } from '../useAppleGeneration';
import { createFallbackSnake } from './createFallbackSnake';
import { generateSnakeSpawnConfig } from '../snakeCreation';

// Cache for initial apples
const cachedInitialApples = Array.from({ length: 4 }, generateApple);

export const createEmergencyGameState = (): GameState => {
  console.log("Creating emergency game state due to initialization failure");
  
  // Create basic snakes in case of error
  const basicSnakes = Array.from({ length: 4 }, (_, i) => {
    const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
    return createFallbackSnake(i, spawnX, spawnY, direction as Direction, color);
  });
  
  return {
    snakes: basicSnakes,
    apples: [...cachedInitialApples],
    gridSize: GRID_SIZE,
  };
};
