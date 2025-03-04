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
  let decisionReason = ""; // Track decision reason for debugging
  let debugReason = ""; // Track debug reason for debugging

  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || gameState.gridSize;

  // STEP 1: Find adjacent apples and obstacles
  const { adjacentApples, adjacentObstacles } = findAdjacentApples(snake, gameState);
  
  // STEP 2: Try to eat an adjacent apple if it's safe (highest priority)
  const appleDirection = getAppleEatingDirection(snake, gameState, adjacentApples, adjacentObstacles);
  
  if (appleDirection) {
    // Adjacent apple available and safe - highest priority
    newDirection = appleDirection;
    decisionReason = "eat_apple";
    debugReason = "eat_apple";
    console.log(`Snake ${snake.id} chose to eat adjacent apple in direction ${newDirection}`);
    
    // Apply reinforcement learning for good decision
    applyReinforcementLearning(snake, true, false);
    
    // Add animation flag for eating
    if (!snake.animation) snake.animation = {};
    snake.animation.isEating = true;
    snake.animation.eatStartTime = Date.now();
  } 
  // STEP 3: If no safe apples, use neural network or fallback to safe direction
  else {
    // Clear eating animation flag
    if (snake.animation) {
      snake.animation.isEating = false;
    }
    
    // If there are adjacent apples but they're blocked, record them
    if (adjacentApples.length > 0) {
      snake.decisionMetrics.applesIgnored++;
      decisionReason = "blocked_apple";
      debugReason = "blocked_apple";
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
        decisionReason = "neural_network";
        debugReason = "neural_network";
        
        // Add animation flag for high confidence decision
        if (!snake.animation) snake.animation = {};
        snake.animation.confidence = predictionValue;
        snake.animation.decisionTime = Date.now();
        
        if (predictionValue < 0.6) {
          console.log(`Snake ${snake.id} chose risky direction: ${newDirection} with confidence ${predictionValue.toFixed(2)}`);
        }
      } else {
        // Fall back to finding a safe direction
        newDirection = findSafeDirection(snake, gameState, predictions);
        decisionReason = "safe_fallback";
        debugReason = "safe_fallback";
      }
    } else {
      // No predictions available, use safe direction algorithm
      newDirection = findSafeDirection(snake, gameState, [0, 0, 0, 0]);
      decisionReason = "safe_direction";
      debugReason = "safe_direction";
    }
    
    // If still heading into danger, log it
    if (adjacentObstacles.some(obs => obs.dir === newDirection)) {
      console.log(`Snake ${snake.id} chose dangerous direction: ${newDirection}`);
      decisionReason = "risky_direction";
      debugReason = "risky_direction";
      
      // Add animation flag for danger
      if (!snake.animation) snake.animation = {};
      snake.animation.isDangerous = true;
      snake.animation.dangerTime = Date.now();
    } else {
      // Clear danger flag
      if (snake.animation) {
        snake.animation.isDangerous = false;
      }
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

  // Set debug info about decision
  snake.debugInfo = {
    ...snake.debugInfo,
    lastDecision: {
      direction: newDirection,
      reason: debugReason,
      confidence: predictionValue,
      headPosition: { ...newHead },
      time: Date.now()
    }
  };

  // Return updated snake
  return {
    ...updatedSnake,
    positions: newPositions,
    direction: newDirection,
    lastOutputs: outputs,  // Save outputs for learning
    lastInputs: inputs,    // Save inputs for learning
    movesWithoutEating: snake.movesWithoutEating,
    animation: updatedSnake.animation || {} // Ensure animation data is preserved
  };
};
