
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
    if (!snake.alive) continue;
    
    const head = snake.positions[0];
    
    // Check if snake ate an apple
    const appleIndex = updatedApples.findIndex(apple => 
      apple.position.x === head.x && apple.position.y === head.y
    );
    
    if (appleIndex !== -1) {
      console.log(`Snake ${snake.id} ate an apple at (${head.x}, ${head.y})`);
      
      // Increment score - this helps ensure score updates are tracked
      snake.score += 1;
      console.log(`Snake ${snake.id} new score: ${snake.score}`);
      
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
      
      // Add a new segment to the snake (RESTORED FUNCTIONALITY)
      const lastSegment = snake.positions[snake.positions.length - 1];
      snake.positions.push({ ...lastSegment });
      console.log(`Snake ${snake.id} grew to ${snake.positions.length} segments`);
      
      // Update score based on snake length
      snake.score = snake.positions.length - 3; // Base score is segments minus initial length (3)
      
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
  // Generate an apple for each segment of the snake (RESTORED FUNCTIONALITY)
  return snake.positions.map((position, index) => ({
    id: Date.now() + index * 10, // Ensure unique IDs for each apple
    position: { ...position }
  }));
};

