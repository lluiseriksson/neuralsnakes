
import { Snake, Apple } from '../types';
import { checkSelfCollision, checkSnakeCollisions } from './snakeCollisions';
import { checkAppleCollisions, generateAppleExplosion } from './appleCollisions';
import { handleRespawn } from './respawnLogic';

export const checkCollisions = (snakes: Snake[], currentApples: Apple[]) => {
  let updatedSnakes = [...snakes];
  let updatedApples = [...currentApples];
  const newApplePositions: Array<{position: {x: number, y: number}}> = [];
  
  // Process self-collisions first
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    if (checkSelfCollision(snake)) {
      // Generate apple explosion when snake collides with itself
      const explosionApples = generateAppleExplosion(snake);
      newApplePositions.push(...explosionApples);
      
      // Mark snake as dead
      snake.alive = false;
    }
  }
  
  // Process snake-to-snake collisions
  updatedSnakes = checkSnakeCollisions(updatedSnakes);
  
  // Process apple collisions
  const appleCollisionResult = checkAppleCollisions(updatedSnakes, updatedApples);
  updatedSnakes = appleCollisionResult.snakes;
  updatedApples = appleCollisionResult.apples;
  newApplePositions.push(...appleCollisionResult.newApplePositions);
  
  // Add any new apples from explosions
  updatedApples = [...updatedApples, ...newApplePositions];
  
  // Handle respawning
  updatedSnakes = handleRespawn(updatedSnakes);
  
  return { newSnakes: updatedSnakes, newApples: updatedApples };
};
