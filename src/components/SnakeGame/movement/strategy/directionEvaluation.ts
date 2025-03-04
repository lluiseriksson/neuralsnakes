
import { Snake, Direction } from "../../types";
import { isOppositeDirection } from '../directionUtils';

/**
 * Evaluates and scores each possible direction for the snake to move
 */
export const evaluateDirections = (
  snake: Snake,
  predictions: number[],
  adjacentObstacles: Array<{pos: {x: number, y: number}, dir: Direction}>
): Array<{
  direction: Direction,
  originalValue: number,
  adjustedScore: number,
  isOpposite: boolean,
  isObstacle: boolean
}> => {
  if (!predictions || predictions.length !== 4) {
    console.error("Invalid predictions array:", predictions);
    return [];
  }
  
  // Map directions to their predictions
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  
  // Log predictions for debugging
  console.log(`Snake ${snake.id} (gen: ${snake.brain.getGeneration()}) predictions:`, 
    directions.map((dir, i) => `${dir}: ${predictions[i].toFixed(3)}`).join(', '));
  
  // Create a more sophisticated evaluation of each direction
  return directions.map((dir, index) => {
    // Base score is the neural network prediction
    let score = predictions[index];
    
    // Significant penalty for opposite directions
    const isOpposite = isOppositeDirection(snake.direction, dir);
    if (isOpposite) {
      score *= 0.05; // Increased penalty from 0.2 to 0.05 (95% reduction) for opposite directions
    }
    
    // Severe penalty for immediate obstacles
    const isObstacle = adjacentObstacles.some(obs => obs.dir === dir);
    if (isObstacle) {
      score *= 0.01; // Increased penalty from 0.1 to 0.01 (99% reduction) for obstacles
    }
    
    // Slight preference for continuing in the same direction for momentum
    if (dir === snake.direction) {
      score *= 1.3; // Increased from 1.2 to 1.3 (30% bonus for same direction)
    }
    
    // Prevent complete stagnation by slightly preferring different directions occasionally
    if (snake.movesWithoutEating && snake.movesWithoutEating > 5 && dir !== snake.direction) {
      score *= 1.4; // Increased bonus from 1.1 to 1.4 when stuck
    }
    
    // Add randomization to break symmetry and overcome straight-line movement
    if (snake.brain.getGeneration() < 5) {
      score += Math.random() * 0.3; // Add noise for younger networks to encourage exploration
    }
    
    return {
      direction: dir,
      originalValue: predictions[index],
      adjustedScore: score,
      isOpposite,
      isObstacle
    };
  });
};
