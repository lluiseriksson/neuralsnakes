
import { Snake, Apple } from '../types';
import { checkSelfCollision, checkSnakeCollisions } from './snakeCollisions';
import { checkAppleCollisions, generateAppleExplosion } from './appleCollisions';
import { handleRespawn } from './respawnLogic';

export const checkCollisions = (snakes: Snake[], currentApples: Apple[]) => {
  let updatedSnakes = [...snakes];
  let updatedApples = [...currentApples];
  const newApplePositions: Apple[] = [];
  
  // Process self-collisions first
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    if (checkSelfCollision(snake)) {
      // Generate apple explosion when snake collides with itself (RESTORED FUNCTIONALITY)
      const explosionApples = generateAppleExplosion(snake);
      newApplePositions.push(...explosionApples);
      console.log(`Snake ${snake.id} self-collision generated ${explosionApples.length} apples`);
      
      // Mark snake as dead
      snake.alive = false;
      console.log(`Snake ${snake.id} died from self-collision. Final score: ${snake.score}`);
    }
  }
  
  // Process snake-to-snake collisions
  const snakesBeforeCollisions = [...updatedSnakes.map(s => ({
    id: s.id,
    alive: s.alive,
    positions: [...s.positions]
  }))];
  
  updatedSnakes = checkSnakeCollisions(updatedSnakes);
  
  // Generate apple explosions for snake-vs-snake collisions
  for (let i = 0; i < snakesBeforeCollisions.length; i++) {
    const snakeBefore = snakesBeforeCollisions[i];
    const snakeAfter = updatedSnakes[i];
    
    // If a snake was alive before and is now dead, generate apples
    if (snakeBefore.alive && !snakeAfter.alive) {
      // For head-to-head collisions, generate apples equal to the snake's segments
      const explosionApples = generateAppleExplosion(snakeBefore);
      newApplePositions.push(...explosionApples);
      console.log(`Snake ${snakeBefore.id} collision generated ${explosionApples.length} apples`);
    }
  }
  
  // Process apple collisions
  const appleCollisionResult = checkAppleCollisions(updatedSnakes, updatedApples);
  updatedSnakes = appleCollisionResult.snakes;
  updatedApples = appleCollisionResult.apples;
  newApplePositions.push(...appleCollisionResult.newApplePositions);
  
  // Add any new apples from explosions
  updatedApples = [...updatedApples, ...newApplePositions];
  
  // Handle respawning
  updatedSnakes = handleRespawn(updatedSnakes);
  
  // Ensure all snakes have their scores properly reflected in brain stats
  updatedSnakes.forEach(snake => {
    if (snake.brain && typeof snake.brain.setScore === 'function') {
      snake.brain.setScore(snake.score);
    }
  });
  
  return { newSnakes: updatedSnakes, newApples: updatedApples };
};

