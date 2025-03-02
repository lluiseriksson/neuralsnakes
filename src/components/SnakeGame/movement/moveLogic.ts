
import { Snake, GameState } from "../types";
import { findSafeDirection } from "./strategy/safeMoveStrategy";
import { findAdjacentApples, getAppleEatingDirection } from "./strategy/appleStrategy";
import { getNeuralNetworkDirection } from "./strategy/neuralNetworkStrategy";
import { calculateNewHead, updateSnakeMetrics, createDirectionOutput } from "./moveUtils";
import { applyReinforcementLearning } from "./learning";

export const moveSnake = (snake: Snake, gameState: GameState, predictions?: number[]): Snake => {
  // Safety check - if snake is not alive, don't move it
  if (!snake || !snake.alive) {
    return snake;
  }
  
  // Safety check - ensure snake has positions
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Snake ${snake.id} without valid positions:`, snake);
    return snake;
  }
  
  // Initialize movesWithoutEating if it doesn't exist
  if (snake.movesWithoutEating === undefined) {
    snake.movesWithoutEating = 0;
  } else {
    snake.movesWithoutEating++;
  }
  
  // Initialize decision metrics if they don't exist
  if (!snake.decisionMetrics) {
    snake.decisionMetrics = {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0
    };
  }
  
  // Make a deep copy of positions to avoid accidental modifications
  const positions = [...snake.positions.map(pos => ({ ...pos }))];
  const head = positions[0];
  let newDirection = snake.direction;
  let predictionValue;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || gameState.gridSize;

  // STEP 1: Find adjacent apples and obstacles
  const { adjacentApples, adjacentObstacles } = findAdjacentApples(snake, gameState);
  
  // STEP 2: Try to eat an adjacent apple if it's safe (highest priority)
  const appleDirection = getAppleEatingDirection(snake, gameState, adjacentApples, adjacentObstacles);
  
  if (appleDirection) {
    // Adjacent apple available and safe - highest priority
    newDirection = appleDirection;
    console.log(`Snake ${snake.id} chose to eat adjacent apple in direction ${newDirection}`);
    
    // Apply reinforcement learning for good decision
    applyReinforcementLearning(snake, true, false);
  } 
  // STEP 3: If no safe apples, use neural network or fallback to safe direction
  else {
    // If there are adjacent apples but they're blocked, record them
    if (adjacentApples.length > 0) {
      snake.decisionMetrics.applesIgnored++;
      console.log(`Snake ${snake.id} ignored blocked apple`);
      
      // Apply reinforcement learning for missing an apple
      applyReinforcementLearning(snake, false, true);
    }
    
    // Use neural network model only if there are no safe adjacent apples and predictions are available
    if (predictions && predictions.length === 4) {
      const nnDirection = getNeuralNetworkDirection(snake, predictions, adjacentObstacles);
      
      if (nnDirection) {
        newDirection = nnDirection;
        predictionValue = predictions[['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(newDirection)];
        
        if (predictionValue < 0.6) {
          console.log(`Snake ${snake.id} chose risky direction: ${newDirection} with confidence ${predictionValue.toFixed(2)}`);
        }
      } else {
        // Fall back to finding a safe direction
        newDirection = findSafeDirection(snake, gameState, predictions);
      }
    } else {
      // No predictions available, use safe direction algorithm
      newDirection = findSafeDirection(snake, gameState, [0, 0, 0, 0]);
    }
    
    // If still heading into danger, log it
    if (adjacentObstacles.some(obs => obs.dir === newDirection)) {
      console.log(`Snake ${snake.id} chose dangerous direction: ${newDirection}`);
    }
  }

  // Calculate the new head position
  const newHead = calculateNewHead(head, newDirection, gridSize);

  // Create new positions array with the new head at index 0
  const newPositions = [newHead];
  for (let i = 0; i < positions.length - 1; i++) {
    newPositions.push({ ...positions[i] });
  }

  // Create directional outputs for learning
  const outputs = createDirectionOutput(newDirection);

  // Save current inputs for learning
  const inputs = [...(snake.lastInputs || [])];

  // Update decision metrics
  const updatedSnake = updateSnakeMetrics(snake, newDirection, !!appleDirection, predictionValue);

  // Return updated snake
  return {
    ...updatedSnake,
    positions: newPositions,
    direction: newDirection,
    lastOutputs: outputs,  // Save outputs for learning
    lastInputs: inputs,    // Save inputs for learning
    movesWithoutEating: snake.movesWithoutEating
  };
};
