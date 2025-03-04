
import { Snake, GameState, Apple } from '../../types';
import { GRID_SIZE } from '../../constants';

/**
 * Apply positive reinforcement for eating an apple
 */
export const applyPositiveAppleLearning = (snake: Snake, gameState: GameState): void => {
  if (!snake.lastInputs || !snake.lastOutputs) return;
  
  // Add learning event to debug info
  if (!snake.debugInfo) snake.debugInfo = {};
  if (!snake.debugInfo.learningEvents) snake.debugInfo.learningEvents = [];
  
  // Record this learning event
  snake.debugInfo.learningEvents.push({
    reward: 3.0,
    type: 'apple_eaten'
  });
  
  // Apply high reward for eating an apple
  console.log(`Snake ${snake.id} got reward for eating apple`);
  
  // Apply learning
  snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, 3.0);
};

/**
 * Apply learning based on whether the snake is moving closer to an apple
 */
export const applyDistanceBasedLearning = (
  snake: Snake,
  gameState: GameState,
  previousDistance: number,
  currentDistance: number
): void => {
  if (!snake.lastInputs || !snake.lastOutputs) return;
  
  // If no apples, skip learning
  if (gameState.apples.length === 0) return;
  
  // If distance improved (snake got closer to an apple)
  if (currentDistance < previousDistance) {
    // Apply positive reinforcement (mild)
    const reward = 1.2;
    console.log(`Snake ${snake.id} got closer to apple: ${previousDistance.toFixed(1)} -> ${currentDistance.toFixed(1)}`);
    
    // Apply learning
    snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
    
    // Add learning event to debug info
    if (!snake.debugInfo) snake.debugInfo = {};
    if (!snake.debugInfo.learningEvents) snake.debugInfo.learningEvents = [];
    
    // Record positive learning event
    snake.debugInfo.learningEvents.push({
      reward: reward,
      type: 'improved_distance'
    });
  } 
  // If distance worsened significantly (snake is moving away from apple)
  else if (currentDistance > previousDistance + 2) {
    // Apply negative reinforcement (mild)
    const penalty = 0.8;
    console.log(`Snake ${snake.id} moved away from apple: ${previousDistance.toFixed(1)} -> ${currentDistance.toFixed(1)}`);
    
    // Apply learning
    snake.brain.learn(false, snake.lastInputs, snake.lastOutputs, penalty);
    
    // Add learning event to debug info
    if (!snake.debugInfo) snake.debugInfo = {};
    if (!snake.debugInfo.learningEvents) snake.debugInfo.learningEvents = [];
    
    // Record negative learning event
    snake.debugInfo.learningEvents.push({
      reward: -penalty,
      type: 'worsened_distance'
    });
  }
  // No significant change in distance
  else {
    // Apply very mild negative reinforcement to discourage staying in place
    const penalty = 0.5;
    console.log(`Snake ${snake.id} didn't significantly change distance to apple`);
    
    // Apply learning
    snake.brain.learn(false, snake.lastInputs, snake.lastOutputs, penalty);
  }
};

/**
 * Check if snake is ignoring adjacent apples and apply penalty if so
 */
export const applyMissedApplePenalty = (
  snake: Snake,
  gameState: GameState,
  apples: Apple[]
): void => {
  if (!snake.lastInputs || !snake.lastOutputs) return;
  
  const head = snake.positions[0];
  let adjacentAppleFound = false;
  
  // Use actual grid size for more accurate adjacency detection
  const gridSize = snake.gridSize || GRID_SIZE;
  
  // Check for apples in all 8 adjacent cells (including diagonals)
  for (const apple of apples) {
    const dx = Math.abs(head.x - apple.position.x);
    const dy = Math.abs(head.y - apple.position.y);
    
    // Handle grid wrap-around
    const wrappedDx = Math.min(dx, gridSize - dx);
    const wrappedDy = Math.min(dy, gridSize - dy);
    
    // If apple is in an adjacent cell (including diagonals)
    if (wrappedDx <= 1 && wrappedDy <= 1) {
      adjacentAppleFound = true;
      break;
    }
  }
  
  // If there was an adjacent apple but snake didn't eat it
  if (adjacentAppleFound) {
    // Apply penalty for missing an adjacent apple
    const penalty = 1.0;
    console.log(`Snake ${snake.id} missed an adjacent apple, applying penalty`);
    
    // Apply learning
    snake.brain.learn(false, snake.lastInputs, snake.lastOutputs, penalty);
    
    // Add learning event to debug info
    if (!snake.debugInfo) snake.debugInfo = {};
    if (!snake.debugInfo.learningEvents) snake.debugInfo.learningEvents = [];
    
    // Record missed apple event
    snake.debugInfo.learningEvents.push({
      reward: -penalty,
      type: 'missed_apple'
    });
  }
};
