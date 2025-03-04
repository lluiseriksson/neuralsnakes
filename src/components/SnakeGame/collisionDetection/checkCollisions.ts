
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
      // Generate apple explosion when snake collides with itself
      const explosionApples = generateAppleExplosion(snake);
      newApplePositions.push(...explosionApples);
      console.log(`Snake ${snake.id} self-collision generated ${explosionApples.length} apples`);
      
      // Mark snake as dead
      snake.alive = false;
      console.log(`Snake ${snake.id} died from self-collision. Final score: ${snake.score}`);
    }
  }
  
  // Process snake-to-snake collisions
  const snakesBeforeCollisions = [...updatedSnakes];
  const collidedSnakes = new Set<number>(); // Track which snakes collided for apple generation
  
  // First identify all collisions before modifying the snakes
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];
    
    // Check collisions with other snakes
    for (let j = 0; j < updatedSnakes.length; j++) {
      if (i === j || !updatedSnakes[j].alive) continue;
      
      const otherSnake = updatedSnakes[j];
      
      // Check for head-to-head collision
      if (head.x === otherSnake.positions[0].x && head.y === otherSnake.positions[0].y) {
        collidedSnakes.add(i);
        collidedSnakes.add(j);
        console.log(`Head-to-head collision between Snake ${snake.id} and Snake ${otherSnake.id}`);
      }
      
      // Check for head-to-body collision
      for (let k = 1; k < otherSnake.positions.length; k++) {
        if (head.x === otherSnake.positions[k].x && head.y === otherSnake.positions[k].y) {
          collidedSnakes.add(i);
          console.log(`Snake ${snake.id} collided with body of Snake ${otherSnake.id}`);
        }
      }
    }
  }
  
  updatedSnakes = checkSnakeCollisions(updatedSnakes);
  
  // Generate apple explosions for snake-vs-snake collisions
  for (let i = 0; i < snakesBeforeCollisions.length; i++) {
    const snakeBefore = snakesBeforeCollisions[i];
    const snakeAfter = updatedSnakes[i];
    
    // If a snake was alive before and is now dead, generate apples
    if (snakeBefore.alive && !snakeAfter.alive) {
      // Generate apples equal to the snake's segments
      const explosionApples = generateAppleExplosion(snakeBefore);
      newApplePositions.push(...explosionApples);
      console.log(`Snake ${snakeBefore.id} collision generated ${explosionApples.length} apples`);
    }
    
    // For head-to-head collisions, ensure both snakes generate apples
    if (collidedSnakes.has(i) && snakeBefore.alive) {
      // Only generate if we haven't already due to the alive check above
      if (snakeAfter.alive) {
        const explosionApples = generateAppleExplosion(snakeBefore);
        newApplePositions.push(...explosionApples);
        console.log(`Snake ${snakeBefore.id} head collision generated ${explosionApples.length} apples`);
      }
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
