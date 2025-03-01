
import { Position, Snake, Apple, GameState } from '../types';

/**
 * Calculates the closest apple to a snake's head
 */
export const findClosestApple = (head: Position, apples: Apple[]): Apple => {
  let closestApple = apples[0];
  let minDistance = Number.MAX_VALUE;
  
  for (const apple of apples) {
    const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestApple = apple;
    }
  }
  
  return closestApple;
};

/**
 * Detects obstacles in the four cardinal directions around the snake's head
 */
export const detectObstacles = (head: Position, snake: Snake): number[] => {
  // Initialize obstacles array [UP, RIGHT, DOWN, LEFT]
  const obstacles = [0, 0, 0, 0];
  
  // Self-collision detection (avoid its own body)
  for (let i = 1; i < snake.positions.length; i++) {
    const segment = snake.positions[i];
    
    if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1; // UP
    if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1; // RIGHT
    if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1; // DOWN
    if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1; // LEFT
  }
  
  return obstacles;
};

/**
 * Generates neural network inputs for a snake based on its state
 */
export const generateNeuralNetworkInputs = (snake: Snake, gameState: GameState): number[] => {
  const head = snake.positions[0];
  const closestApple = findClosestApple(head, gameState.apples);
  const obstacles = detectObstacles(head, snake);
  
  // Create inputs for neural network - EXACT 8 INPUTS
  return [
    head.x / snake.gridSize,                      // Normalized x position
    head.y / snake.gridSize,                      // Normalized y position
    closestApple.position.x / snake.gridSize,     // Normalized apple x
    closestApple.position.y / snake.gridSize,     // Normalized apple y
    obstacles[0],                                 // Obstacle UP
    obstacles[1],                                 // Obstacle RIGHT
    obstacles[2],                                 // Obstacle DOWN
    obstacles[3]                                  // Obstacle LEFT
  ];
};

/**
 * Validates that the neural network inputs are correctly formatted
 */
export const validateInputs = (inputs: number[]): boolean => {
  if (inputs.length !== 8) {
    console.error(`Invalid input length: ${inputs.length}, expected 8`);
    return false;
  }
  return true;
};
