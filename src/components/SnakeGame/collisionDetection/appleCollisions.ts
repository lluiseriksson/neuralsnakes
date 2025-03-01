
import { Snake, Apple } from '../types';

/**
 * Checks if snakes have eaten apples and processes the rewards
 */
export const checkAppleCollisions = (snakes: Snake[], apples: Apple[]): { snakes: Snake[], apples: Apple[], newApplePositions: Array<{position: {x: number, y: number}}> } => {
  const updatedSnakes = [...snakes];
  let updatedApples = [...apples];
  const newApplePositions: Array<{position: {x: number, y: number}}> = [];
  
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
      
      // Reward for eating an apple
      if (snake.lastInputs && snake.lastOutputs) {
        const reward = 3.0; // High reward
        snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
      }
      
      // Reset counter
      snake.movesWithoutEating = 0;
      
      // Update metrics
      if (snake.decisionMetrics) {
        snake.decisionMetrics.applesEaten++;
      }
      
      // Remove the eaten apple
      updatedApples.splice(appleIndex, 1);
    }
  }
  
  return { snakes: updatedSnakes, apples: updatedApples, newApplePositions };
};

/**
 * Generate apple explosions when snakes die
 */
export const generateAppleExplosion = (snake: Snake): Array<{position: {x: number, y: number}}> => {
  return snake.positions.map(position => ({
    position: { ...position }
  }));
};
