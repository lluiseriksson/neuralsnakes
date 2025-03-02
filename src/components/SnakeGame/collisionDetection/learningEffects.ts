
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
  
  // Apply negative learning with more balanced penalty
  // Reduce the penalty to avoid overtraining on negative outcomes
  const adjustedPenalty = Math.min(penaltyMultiplier, 1.2);
  
  console.log(`Snake ${snake.id} learns from failure, penalty=${adjustedPenalty.toFixed(2)}`);
  
  // Apply the learning
  snake.brain.learn(false, lastInputs, snake.lastOutputs || [], adjustedPenalty);
  
  // Track performance metrics if available
  if (snake.decisionMetrics) {
    snake.decisionMetrics.badDirections++;
  }
};

/**
 * Apply positive learning for successful decisions
 */
export const applyPositiveLearning = (snake: Snake, rewardMultiplier: number = 1.0): void => {
  // Skip if no learning data is available
  if (!snake.lastInputs || !snake.lastOutputs) return;
  
  // Apply positive learning with reasonable reward
  const adjustedReward = Math.min(rewardMultiplier, 1.5);
  
  console.log(`Snake ${snake.id} learns from success, reward=${adjustedReward.toFixed(2)}`);
  
  // Apply the learning
  snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, adjustedReward);
  
  // Track performance metrics if available
  if (snake.decisionMetrics) {
    snake.decisionMetrics.goodDirections++;
  }
};
