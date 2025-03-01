
import { Snake, GameState } from '../../types';
import { detectObstacles } from './obstacleFunctions';
import { detectNearbyApples } from './appleFunctions';

/**
 * Generates neural network inputs for a snake based on its state
 */
export const generateNeuralNetworkInputs = (snake: Snake, gameState: GameState): number[] => {
  const head = snake.positions[0];
  const obstacles = detectObstacles(head, snake, gameState);
  
  // Direct detection of nearby apples (especially adjacent ones)
  const nearbyApples = detectNearbyApples(head, gameState.apples, snake.gridSize);
  
  // Create inputs for neural network - EXACT 8 INPUTS
  const inputs = [
    // Apple direction inputs (where is the apple relative to the snake) - MUY REFORZADOS
    nearbyApples[0] * 1.5,                    // Apple is UP (signal amplified)
    nearbyApples[1] * 1.5,                    // Apple is RIGHT (signal amplified)
    nearbyApples[2] * 1.5,                    // Apple is DOWN (signal amplified)
    nearbyApples[3] * 1.5,                    // Apple is LEFT (signal amplified)
    // Obstacle detection inputs (what's blocking the snake)
    obstacles[0],                               // Obstacle UP
    obstacles[1],                               // Obstacle RIGHT
    obstacles[2],                               // Obstacle DOWN
    obstacles[3]                                // Obstacle LEFT
  ];
  
  // Save these inputs to the snake for future learning
  if (snake.lastInputs === undefined) {
    snake.lastInputs = [...inputs];
  } else {
    // Update lastInputs with current inputs for next iteration
    snake.lastInputs = [...inputs];
  }
  
  return inputs;
};

/**
 * Validates that the neural network inputs are correctly formatted
 */
export const validateInputs = (inputs: number[]): boolean => {
  if (inputs.length !== 8) {
    console.error(`Invalid input length: ${inputs.length}, expected 8`);
    return false;
  }
  
  // Check for NaN or invalid values
  for (let i = 0; i < inputs.length; i++) {
    if (isNaN(inputs[i]) || !isFinite(inputs[i])) {
      console.error(`Invalid input value at index ${i}: ${inputs[i]}`);
      return false;
    }
  }
  
  return true;
};
