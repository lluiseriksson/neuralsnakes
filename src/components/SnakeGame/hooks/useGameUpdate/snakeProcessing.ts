
import { GameState, Snake } from '../../types';
import { moveSnake } from '../../movement';
import { generateNeuralNetworkInputs, validateInputs } from '../neuralNetworkInputs';

/**
 * Processes movement for all living snakes
 */
export const processSnakesMovement = (snakes: Snake[], gameState: GameState): Snake[] => {
  return snakes.map(snake => {
    if (!snake.alive) return snake;
    
    // Generate neural network inputs
    const inputs = generateNeuralNetworkInputs(snake, gameState);
    
    // Validate inputs
    if (!validateInputs(inputs)) {
      console.log(`Invalid inputs for snake ${snake.id}`, inputs);
      return snake;
    }

    // Get prediction from neural network
    const prediction = snake.brain.predict(inputs);
    
    // Apply movement with prediction
    const movedSnake = moveSnake(snake, gameState, prediction);
    
    return movedSnake;
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
    snake.alive ? { ...snake.positions[0] } : null
  );
};
