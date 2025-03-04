
import { Snake, Direction } from '../../types';
import { createFallbackSnake } from './createFallbackSnake';
import { generateSnakeSpawnConfig } from '../snakeCreation';

export const validateAndFixSnake = (snake: Snake): Snake => {
  // If snake has no positions or empty positions array, create new positions
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Snake ${snake.id} does not have valid positions, applying correction`);
    const [spawnX, spawnY] = generateSnakeSpawnConfig(snake.id);
    snake.positions = [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}];
    console.log(`Fixed snake ${snake.id} positions: now at (${spawnX}, ${spawnY})`);
  }
  
  // Check if the brain has all required functions
  if (!snake.brain || 
      !snake.brain.predict || 
      !snake.brain.getGeneration ||
      !snake.brain.clone ||
      typeof snake.brain.clone !== 'function') {
    console.error(`Snake ${snake.id} has invalid brain, applying fallback brain`);
    // Create a completely new snake with the fallback brain
    const [spawnX, spawnY, direction] = generateSnakeSpawnConfig(snake.id);
    return createFallbackSnake(
      snake.id, 
      spawnX, 
      spawnY, 
      direction as Direction, 
      snake.color
    );
  }
  
  // Initialize movesWithoutEating if it doesn't exist
  if (snake.movesWithoutEating === undefined) {
    snake.movesWithoutEating = 0;
  }
  
  return snake;
};
