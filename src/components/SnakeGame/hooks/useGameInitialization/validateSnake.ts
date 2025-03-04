
import { Snake, Direction } from '../../types';
import { createFallbackSnake } from './createFallbackSnake';
import { generateSnakeSpawnConfig } from '../snakeCreation';

export const validateAndFixSnake = (snake: Snake): Snake => {
  // Clone the snake to avoid unexpected reference mutations
  const updatedSnake = {...snake};
  
  // If snake has no positions or empty positions array, create new positions
  if (!updatedSnake.positions || updatedSnake.positions.length === 0) {
    console.error(`Snake ${updatedSnake.id} does not have valid positions, applying correction`);
    const [spawnX, spawnY] = generateSnakeSpawnConfig(updatedSnake.id);
    updatedSnake.positions = [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}];
    console.log(`Fixed snake ${updatedSnake.id} positions: now at (${spawnX}, ${spawnY})`);
  }
  
  // Check if the brain has all required functions
  if (!updatedSnake.brain || 
      !updatedSnake.brain.predict || 
      !updatedSnake.brain.getGeneration ||
      !updatedSnake.brain.clone ||
      typeof updatedSnake.brain.clone !== 'function') {
    console.error(`Snake ${updatedSnake.id} has invalid brain, applying fallback brain`);
    // Create a completely new snake with the fallback brain
    const [spawnX, spawnY, direction] = generateSnakeSpawnConfig(updatedSnake.id);
    return createFallbackSnake(
      updatedSnake.id, 
      spawnX, 
      spawnY, 
      direction as Direction, 
      updatedSnake.color || 'green' // Provide a default color if none exists
    );
  }
  
  // Initialize movesWithoutEating if it doesn't exist
  if (updatedSnake.movesWithoutEating === undefined) {
    updatedSnake.movesWithoutEating = 0;
  }
  
  // Ensure alive property is correctly set
  if (updatedSnake.alive === undefined) {
    updatedSnake.alive = true;
  }
  
  // Make sure score matches the actual length of the snake (fixes inconsistencies)
  const expectedScore = Math.max(0, (updatedSnake.positions.length - 3));
  if (updatedSnake.score === undefined || updatedSnake.score !== expectedScore) {
    console.log(`Fixed inconsistent score for snake ${updatedSnake.id}: ${updatedSnake.score} → ${expectedScore}`);
    updatedSnake.score = expectedScore;
  }
  
  // Ensure generation and age are defined
  if (updatedSnake.generation === undefined) {
    updatedSnake.generation = updatedSnake.brain.getGeneration() || 1;
  }
  
  if (updatedSnake.age === undefined) {
    updatedSnake.age = 0;
  }
  
  return updatedSnake;
};
