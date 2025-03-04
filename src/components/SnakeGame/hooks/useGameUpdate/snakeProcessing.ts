
import { GameState, Snake, Position } from '../../types';
import { moveSnake } from '../../movement';
import { generateNeuralNetworkInputs, validateInputs } from '../neuralNetworkInputs';

/**
 * Processes movement for all living snakes
 */
export const processSnakesMovement = (snakes: Snake[], gameState: GameState): Snake[] => {
  return snakes.map(snake => {
    if (!snake.alive) return snake;
    
    // Validate snake before processing to avoid crashes
    if (!snake.positions || snake.positions.length === 0) {
      console.error(`Invalid snake ${snake.id} with no positions, skipping movement`);
      return snake;
    }
    
    // Initialize debug info object if it doesn't exist
    if (!snake.debugInfo) {
      snake.debugInfo = {};
    }
    
    try {
      // Generate neural network inputs
      const inputs = generateNeuralNetworkInputs(snake, gameState);
      
      // Store inputs for visualization
      snake.debugInfo.lastInputs = [...inputs];
      
      // Validate inputs
      if (!validateInputs(inputs)) {
        console.log(`Invalid inputs for snake ${snake.id}`, inputs);
        snake.debugInfo.validationError = true;
        return snake;
      }

      // Get prediction from neural network
      const prediction = snake.brain.predict(inputs);
      
      // Store outputs for visualization and learning
      snake.lastOutputs = [...prediction];
      if (snake.debugInfo) {
        snake.debugInfo.lastOutputs = [...prediction];
      }
      
      // Apply movement with prediction
      const movedSnake = moveSnake(snake, gameState, prediction);
      
      // Add decision record for logging and visualization
      if (!movedSnake.debugInfo.decisions) {
        movedSnake.debugInfo.decisions = [];
      }
      
      // Limit decisions array to prevent memory issues
      if (movedSnake.debugInfo.decisions.length > 20) {
        movedSnake.debugInfo.decisions.shift();
      }
      
      movedSnake.debugInfo.decisions.push({
        direction: movedSnake.direction,
        headPosition: {...movedSnake.positions[0]},
        inputs: inputs,
        outputs: prediction,
        time: Date.now()
      });
      
      return movedSnake;
    } catch (error) {
      console.error(`Error processing movement for snake ${snake.id}:`, error);
      // Return unmodified snake to avoid crashes
      return snake;
    }
  });
};

/**
 * Checks if there are any living snakes
 */
export const hasLivingSnakes = (snakes: Snake[]): boolean => {
  return snakes.some(snake => snake.alive);
};

/**
 * Stores previous positions for each snake for later comparison
 */
export const storePreviousPositions = (snakes: Snake[]): (Position | null)[] => {
  return snakes.map(snake => 
    snake.alive && snake.positions && snake.positions.length > 0 
      ? { ...snake.positions[0] } 
      : null
  );
};
