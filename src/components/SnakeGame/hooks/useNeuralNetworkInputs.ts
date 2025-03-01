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
 * Calculates direction vectors from head to target
 */
export const calculateDirectionVectors = (head: Position, target: Position): number[] => {
  // Direction vectors [UP, RIGHT, DOWN, LEFT]
  const directionVectors = [0, 0, 0, 0];
  
  // Calculate normalized direction to apple
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  
  // Set direction vectors based on the relative position
  if (dy < 0) directionVectors[0] = 1; // UP
  if (dx > 0) directionVectors[1] = 1; // RIGHT
  if (dy > 0) directionVectors[2] = 1; // DOWN
  if (dx < 0) directionVectors[3] = 1; // LEFT
  
  return directionVectors;
};

/**
 * Detects obstacles in the four cardinal directions around the snake's head
 */
export const detectObstacles = (head: Position, snake: Snake, gameState: GameState): number[] => {
  // Initialize obstacles array [UP, RIGHT, DOWN, LEFT]
  const obstacles = [0, 0, 0, 0];
  const gridSize = snake.gridSize;
  
  // Wall detection (boundaries)
  if (head.y === 0) obstacles[0] = 1; // UP wall
  if (head.x === gridSize - 1) obstacles[1] = 1; // RIGHT wall
  if (head.y === gridSize - 1) obstacles[2] = 1; // DOWN wall
  if (head.x === 0) obstacles[3] = 1; // LEFT wall
  
  // Self-collision detection (avoid its own body)
  for (let i = 1; i < snake.positions.length; i++) {
    const segment = snake.positions[i];
    
    if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1; // UP
    if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1; // RIGHT
    if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1; // DOWN
    if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1; // LEFT
  }
  
  // Other snakes collision detection
  for (const otherSnake of gameState.snakes) {
    if (otherSnake.id === snake.id || !otherSnake.alive) continue;
    
    for (const segment of otherSnake.positions) {
      if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1; // UP
      if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1; // RIGHT
      if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1; // DOWN
      if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1; // LEFT
    }
  }
  
  return obstacles;
};

/**
 * Generates neural network inputs for a snake based on its state
 */
export const generateNeuralNetworkInputs = (snake: Snake, gameState: GameState): number[] => {
  const head = snake.positions[0];
  const closestApple = findClosestApple(head, gameState.apples);
  const obstacles = detectObstacles(head, snake, gameState);
  const appleDirections = calculateDirectionVectors(head, closestApple.position);
  
  // Create inputs for neural network - EXACT 8 INPUTS
  return [
    // Apple direction inputs (where is the apple relative to the snake)
    appleDirections[0],                         // Apple is UP
    appleDirections[1],                         // Apple is RIGHT 
    appleDirections[2],                         // Apple is DOWN
    appleDirections[3],                         // Apple is LEFT
    // Obstacle detection inputs (what's blocking the snake)
    obstacles[0],                              // Obstacle UP
    obstacles[1],                              // Obstacle RIGHT
    obstacles[2],                              // Obstacle DOWN
    obstacles[3]                               // Obstacle LEFT
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
