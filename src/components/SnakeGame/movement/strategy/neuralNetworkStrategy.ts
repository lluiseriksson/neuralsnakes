
import { Snake, Direction } from "../../types";
import { isOppositeDirection } from "../directionUtils";

// Function to get the neural network's recommended direction with enhanced decision-making
export const getNeuralNetworkDirection = (
  snake: Snake, 
  predictions: number[],
  adjacentObstacles: Array<{pos: {x: number, y: number}, dir: Direction}>
): Direction | null => {
  if (!predictions || predictions.length !== 4) return null;
  
  // Map directions to their predictions
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  
  // Log predictions for debugging
  console.log(`Snake ${snake.id} (gen: ${snake.brain.getGeneration()}) predictions:`, 
    directions.map((dir, i) => `${dir}: ${predictions[i].toFixed(3)}`).join(', '));
  
  // Create a more sophisticated evaluation of each direction
  const directionEvaluations = directions.map((dir, index) => {
    // Base score is the neural network prediction
    let score = predictions[index];
    
    // Significant penalty for opposite directions
    const isOpposite = isOppositeDirection(snake.direction, dir);
    if (isOpposite) {
      score *= 0.2; // 80% reduction for opposite directions
    }
    
    // Severe penalty for immediate obstacles
    const isObstacle = adjacentObstacles.some(obs => obs.dir === dir);
    if (isObstacle) {
      score *= 0.1; // 90% reduction for obstacles
    }
    
    // Slight preference for continuing in the same direction for momentum
    if (dir === snake.direction) {
      score *= 1.2; // 20% bonus for same direction
    }
    
    // Prevent complete stagnation by slightly preferring different directions occasionally
    if (snake.movesWithoutEating && snake.movesWithoutEating > 10 && dir !== snake.direction) {
      score *= 1.1; // 10% bonus for different directions when stuck
    }
    
    return {
      direction: dir,
      originalValue: predictions[index],
      adjustedScore: score,
      isOpposite,
      isObstacle
    };
  });
  
  // Sort by final adjusted score, highest first
  const sortedEvaluations = [...directionEvaluations].sort((a, b) => b.adjustedScore - a.adjustedScore);
  
  // Print detailed analysis for debugging
  console.log(`Snake ${snake.id} direction evaluations:`, 
    sortedEvaluations.map(e => 
      `${e.direction}: ${e.adjustedScore.toFixed(2)} (original: ${e.originalValue.toFixed(2)})` +
      `${e.isOpposite ? ' (opposite)' : ''}${e.isObstacle ? ' (obstacle)' : ''}`
    ).join(', '));
  
  // Safety check: For very low generation neural networks, be extra cautious
  if (snake.brain.getGeneration() < 30) {
    // Prioritize safety for younger generations
    const safePredictions = sortedEvaluations.filter(p => !p.isObstacle && !p.isOpposite);
    
    if (safePredictions.length > 0) {
      console.log(`Snake ${snake.id} (young gen) using safe direction: ${safePredictions[0].direction}`);
      return safePredictions[0].direction;
    }
    
    // If all directions have obstacles or are opposite, prioritize avoiding obstacles
    const nonObstaclePredictions = sortedEvaluations.filter(p => !p.isObstacle);
    if (nonObstaclePredictions.length > 0) {
      console.log(`Snake ${snake.id} (young gen) using non-obstacle direction: ${nonObstaclePredictions[0].direction}`);
      return nonObstaclePredictions[0].direction;
    }
  }
  
  // For higher generations, trust the adjusted scores more
  // Check if the best score has a significant margin over second best
  if (sortedEvaluations.length >= 2) {
    const margin = sortedEvaluations[0].adjustedScore - sortedEvaluations[1].adjustedScore;
    const confident = margin > 0.2; // Require 20% margin for confidence
    
    if (confident) {
      console.log(`Snake ${snake.id} using high-confidence direction ${sortedEvaluations[0].direction} (margin: ${margin.toFixed(2)})`);
      return sortedEvaluations[0].direction;
    }
  }
  
  // When not confident, balance network predictions with safety
  // Look for the highest-scoring direction that's not directly into an obstacle
  const nonObstacleChoices = sortedEvaluations.filter(e => !e.isObstacle);
  if (nonObstacleChoices.length > 0) {
    console.log(`Snake ${snake.id} using balanced choice: ${nonObstacleChoices[0].direction}`);
    return nonObstacleChoices[0].direction;
  }
  
  // If all directions have obstacles, choose the one with highest adjusted score
  // that's not opposite to current direction if possible
  const nonOppositeChoices = sortedEvaluations.filter(e => !e.isOpposite);
  if (nonOppositeChoices.length > 0) {
    console.log(`Snake ${snake.id} in tight spot, using: ${nonOppositeChoices[0].direction}`);
    return nonOppositeChoices[0].direction;
  }
  
  // Last resort: just take the highest adjusted score
  console.log(`Snake ${snake.id} using last resort: ${sortedEvaluations[0].direction}`);
  return sortedEvaluations[0].direction;
};
