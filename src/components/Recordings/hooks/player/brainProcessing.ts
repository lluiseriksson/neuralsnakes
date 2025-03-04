
import { Snake } from "../../../SnakeGame/types";
import { MinimalBrain } from "./MinimalBrain";

/**
 * Process a snake to ensure it has valid brain properties for visualization
 */
export const processSnake = (snake: Snake): Snake => {
  if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
    // Get brain data from snake object if available
    let generation = 0;
    let score = snake.score || 0;
    
    // Try to extract generation from different sources
    if (typeof snake.brain === 'object' && snake.brain !== null) {
      if (typeof snake.brain.getGeneration === 'function') {
        try {
          generation = snake.brain.getGeneration();
        } catch (error) {
          console.error("Error calling getGeneration:", error);
        }
      }
    }
    
    // Create a proper NeuralNetwork implementation
    return {
      ...snake,
      brain: new MinimalBrain(generation, score)
    };
  }
  return snake;
};

/**
 * Process all snakes in a game state
 */
export const processGameState = (state: any): any => {
  if (!state || !state.snakes) {
    console.error("Invalid game state - missing snakes array");
    return state;
  }
  
  return {
    ...state,
    snakes: state.snakes.map(processSnake)
  };
};
