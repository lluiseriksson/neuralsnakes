
import { Snake, Direction } from "../../types";
import { isOppositeDirection } from "../directionUtils";

// Function to get the neural network's recommended direction
export const getNeuralNetworkDirection = (
  snake: Snake, 
  predictions: number[],
  adjacentObstacles: Array<{pos: {x: number, y: number}, dir: Direction}>
): Direction | null => {
  if (!predictions || predictions.length !== 4) return null;
  
  // Map directions to their predictions
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  
  // Create a sorted list of directions by prediction value
  const sortedPredictions = directions.map((dir, index) => ({
    direction: dir,
    value: predictions[index],
    isOpposite: isOppositeDirection(snake.direction, dir),
    isObstacle: adjacentObstacles.some(obs => obs.dir === dir)
  })).sort((a, b) => b.value - a.value);
  
  // First try the most promising direction if it's safe
  for (const pred of sortedPredictions) {
    if (!pred.isOpposite && !pred.isObstacle) {
      return pred.direction;
    }
  }
  
  // If all directions have obstacles, choose the least bad one
  if (sortedPredictions.length > 0) {
    // First avoid opposite directions
    const nonOppositeChoices = sortedPredictions.filter(p => !p.isOpposite);
    if (nonOppositeChoices.length > 0) {
      return nonOppositeChoices[0].direction;
    } else {
      // If all are opposite, choose the one with the highest value
      return sortedPredictions[0].direction;
    }
  }
  
  return null;
};
