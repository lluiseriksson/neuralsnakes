
import { Snake, Position, Direction } from "../types";
import { GRID_SIZE } from "../constants";

// Calculate the new head position based on the current direction
export const calculateNewHead = (head: Position, direction: Direction, gridSize: number = GRID_SIZE): Position => {
  const newHead = { ...head };
  
  switch (direction) {
    case 'UP':
      newHead.y = (newHead.y - 1 + gridSize) % gridSize;
      break;
    case 'DOWN':
      newHead.y = (newHead.y + 1) % gridSize;
      break;
    case 'LEFT':
      newHead.x = (newHead.x - 1 + gridSize) % gridSize;
      break;
    case 'RIGHT':
      newHead.x = (newHead.x + 1) % gridSize;
      break;
  }
  
  return newHead;
};

// Update the snake's metrics after making a decision
export const updateSnakeMetrics = (
  snake: Snake, 
  newDirection: Direction, 
  hadAdjacentApple: boolean,
  predictionValue: number
): Snake => {
  // Create a deep copy of the metrics to avoid mutation
  const decisionMetrics = { ...(snake.decisionMetrics || {
    applesEaten: 0,
    applesIgnored: 0,
    badDirections: 0,
    goodDirections: 0
  })};
  
  // Update metrics based on the decision
  if (hadAdjacentApple) {
    decisionMetrics.applesEaten++;
  }
  
  // Consider prediction quality if available
  if (predictionValue !== undefined) {
    if (predictionValue > 0.6) {
      decisionMetrics.goodDirections++;
    } else {
      decisionMetrics.badDirections++;
    }
  }
  
  return {
    ...snake,
    decisionMetrics
  };
};

// Function to create output array for neural network learning
export const createDirectionOutput = (direction: Direction): number[] => {
  const directionIndex = ['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(direction);
  const outputs = [0, 0, 0, 0];
  if (directionIndex >= 0) {
    outputs[directionIndex] = 1;
  }
  return outputs;
};
