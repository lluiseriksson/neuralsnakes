
import { Snake, Apple } from '../types';

/**
 * Checks if snakes have eaten apples and processes the rewards
 */
export const checkAppleCollisions = (snakes: Snake[], apples: Apple[]): { snakes: Snake[], apples: Apple[], newApplePositions: Apple[] } => {
  const updatedSnakes = [...snakes];
  let updatedApples = [...apples];
  const newApplePositions: Apple[] = [];
  
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive || !snake.positions || snake.positions.length === 0) continue;
    
    const head = snake.positions[0];
    
    // Check if snake ate an apple
    const appleIndex = updatedApples.findIndex(apple => 
      apple.position.x === head.x && apple.position.y === head.y
    );
    
    if (appleIndex !== -1) {
      // Store original values for debugging
      const originalScore = snake.score;
      const originalLength = snake.positions.length;
      
      console.log(`Snake ${snake.id} ate an apple at (${head.x}, ${head.y})`);
      
      // Increment score - this helps ensure score updates are tracked
      snake.score += 1;
      console.log(`Snake ${snake.id} new score: ${snake.score} (from ${originalScore})`);
      
      // Update the brain's score record
      if (snake.brain && typeof snake.brain.setScore === 'function') {
        snake.brain.setScore(snake.score);
      }
      
      // Reward for eating an apple
      if (snake.lastInputs && snake.lastOutputs) {
        const reward = 3.0; // High reward
        snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
      }
      
      // Reset counter
      snake.movesWithoutEating = 0;
      
      // Update metrics
      if (snake.decisionMetrics) {
        snake.decisionMetrics.applesEaten = (snake.decisionMetrics.applesEaten || 0) + 1;
        console.log(`Snake ${snake.id} apples eaten: ${snake.decisionMetrics.applesEaten}`);
      }
      
      // Add a new segment to the snake
      const lastSegment = snake.positions[snake.positions.length - 1];
      snake.positions.push({ ...lastSegment });
      console.log(`Snake ${snake.id} grew to ${snake.positions.length} segments (from ${originalLength})`);
      
      // Update score based on snake length - ensure consistency
      snake.score = snake.positions.length - 3; // Base score is segments minus initial length (3)
      console.log(`Snake ${snake.id} updated length-based score: ${snake.score} for ${snake.positions.length} segments`);
      
      // Remove the eaten apple
      updatedApples.splice(appleIndex, 1);
    }
  }
  
  return { snakes: updatedSnakes, apples: updatedApples, newApplePositions };
};

/**
 * Generate apple explosions when snakes die
 */
export const generateAppleExplosion = (snake: Snake): Apple[] => {
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Cannot generate apple explosion for snake ${snake.id} with invalid positions`);
    return [];
  }
  
  console.log(`Generating apple explosion for snake ${snake.id} with ${snake.positions.length} segments`);
  
  // The grid size is typically defined in the snake or is a constant (30)
  const gridSize = snake.gridSize || 30;
  
  // Generate apples for every segment position 
  // We don't filter out positions that would be off the grid because we handle
  // wraparound in the position generation
  const explosionApples = snake.positions.map((position, index) => {
    // Ensure position is within grid bounds by using modulo
    const safePosition = {
      x: ((position.x % gridSize) + gridSize) % gridSize,
      y: ((position.y % gridSize) + gridSize) % gridSize
    };
    
    return {
      id: Date.now() + index * 10, // Ensure unique IDs for each apple
      position: safePosition,
      type: 'B' // Mark as type B apple from collision
    };
  });
  
  console.log(`Generated ${explosionApples.length} new type B apples from snake ${snake.id}`);
  return explosionApples;
};
