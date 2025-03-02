
import { GameState, Snake } from '../../types';
import { generateNeuralNetworkInputs } from '../neuralNetworkInputs';

/**
 * Apply positive reinforcement for eating an apple
 */
export const applyPositiveAppleLearning = (snake: Snake, prevState: GameState): void => {
  // Significant positive reinforcement for eating apples
  const inputs = generateNeuralNetworkInputs(snake, prevState);
  const reward = 2.0 + (Math.min(snake.score, 10) * 0.1); // Higher reward as score increases, but capped
  
  // Learn from the successful move using the last outputs that led to this position
  snake.brain.learn(true, inputs, snake.lastOutputs || [], reward);
};

/**
 * Calculate if the snake is moving closer to an apple and apply appropriate learning
 */
export const applyDistanceBasedLearning = (
  snake: Snake, 
  prevState: GameState, 
  previousDistance: number, 
  currentMinDistance: number
): void => {
  const distanceDelta = previousDistance - currentMinDistance;
  const inputs = generateNeuralNetworkInputs(snake, prevState);
  
  if (distanceDelta > 0) {
    // Moving toward apple - reward proportional to improvement
    const reward = 0.3 + Math.min(distanceDelta * 0.1, 0.2);
    snake.brain.learn(true, inputs, snake.lastOutputs || [], reward);
  } else if (distanceDelta === 0) {
    // Not making progress toward apple, but not moving away either
    // Very mild negative reinforcement
    const penalty = 0.1;
    snake.brain.learn(false, inputs, snake.lastOutputs || [], penalty);
  } else {
    // Moving away from apple - penalty proportional to regression
    const penalty = 0.2 + Math.min(Math.abs(distanceDelta) * 0.1, 0.3);
    snake.brain.learn(false, inputs, snake.lastOutputs || [], penalty);
  }
};

/**
 * Check if there are apples adjacent to the snake that it didn't take and apply penalties
 */
export const applyMissedApplePenalty = (snake: Snake, prevState: GameState, finalApples: GameState['apples']): void => {
  const head = snake.positions[0];
  const adjacentCells = [
    { x: (head.x + 1) % snake.gridSize, y: head.y },                    // Right
    { x: (head.x - 1 + snake.gridSize) % snake.gridSize, y: head.y },   // Left
    { x: head.x, y: (head.y + 1) % snake.gridSize },                    // Down
    { x: head.x, y: (head.y - 1 + snake.gridSize) % snake.gridSize }    // Up
  ];
  
  const missedApples = finalApples.filter(apple => 
    adjacentCells.some(cell => cell.x === apple.position.x && cell.y === apple.position.y)
  );
  
  if (missedApples.length > 0) {
    // Snake missed an adjacent apple - apply stronger negative reinforcement
    const missedPenalty = 0.5; // Higher penalty for missing adjacent apples
    const inputs = generateNeuralNetworkInputs(snake, prevState);
    snake.brain.learn(false, inputs, snake.lastOutputs || [], missedPenalty);
  }
};
