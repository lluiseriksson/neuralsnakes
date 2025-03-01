
import { Snake } from '../types';

/**
 * Apply negative learning to the snake's neural network
 */
export const applyNegativeLearning = (snake: Snake, penaltyMultiplier: number = 1.0): void => {
  // Use the last inputs and outputs for learning
  const lastInputs = snake.lastInputs || [
    snake.positions[0].x / snake.gridSize,
    snake.positions[0].y / snake.gridSize,
    // Default values for missing inputs
    0.5, 0.5, // Approximate apple position
    1, 0, 0, 0 // Obstacle detected in direction that caused death
  ];
  
  // Apply negative learning with specified penalty
  snake.brain.learn(false, lastInputs, snake.lastOutputs || [], penaltyMultiplier);
};
