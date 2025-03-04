
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
  const headToHeadCollisions = new Set<number>(); // Track which snakes had head-to-head collisions
  
  // Identify head-to-head collisions before processing
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];
    
    for (let j = i + 1; j < updatedSnakes.length; j++) {
      const otherSnake = updatedSnakes[j];
      if (!otherSnake.alive) continue;
      
      const otherHead = otherSnake.positions[0];
      
      // Check for head-to-head collision
      if (head.x === otherHead.x && head.y === otherHead.y) {
        headToHeadCollisions.add(i);
        headToHeadCollisions.add(j);
        console.log(`Head-to-head collision between Snake ${snake.id} and Snake ${otherSnake.id} detected in checkCollisions`);
      }
    }
  }
  
  // Explicitly generate apple explosions for head-to-head collisions before processing other collisions
  Array.from(headToHeadCollisions).forEach(index => {
    const snake = updatedSnakes[index];
    if (snake.alive) {
      // Generate explosion apples for each head-to-head collision snake
      const explosionApples = generateAppleExplosion(snake);
      newApplePositions.push(...explosionApples);
      console.log(`Head-to-head collision: Snake ${snake.id} generated ${explosionApples.length} explosion apples`);
    }
  });
  
  // Process all collisions including head-to-head
  updatedSnakes = checkSnakeCollisions(updatedSnakes);
  
  // Generate apple explosions for other snake-vs-snake collisions
  for (let i = 0; i < snakesBeforeCollisions.length; i++) {
    const snakeBefore = snakesBeforeCollisions[i];
    const snakeAfter = updatedSnakes[i];
    
    // If a snake was alive before and is now dead and it wasn't a head-to-head collision
    if (snakeBefore.alive && !snakeAfter.alive && !headToHeadCollisions.has(i)) {
      // Generate apples equal to the snake's segments
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
