
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
  
  // Safety check: Give preference to safe directions that aren't opposite
  // First try directions that have no obstacles and aren't opposite to current direction
  const safePredictions = sortedPredictions.filter(p => !p.isObstacle && !p.isOpposite);
  
  if (safePredictions.length > 0) {
    return safePredictions[0].direction;
  }
  
  // If all directions have obstacles or are opposite, prioritize avoiding obstacles
  const nonObstaclePredictions = sortedPredictions.filter(p => !p.isObstacle);
  if (nonObstaclePredictions.length > 0) {
    return nonObstaclePredictions[0].direction;
  }
  
  // If all directions have obstacles, choose the one with highest value that isn't opposite
  const nonOppositePredictions = sortedPredictions.filter(p => !p.isOpposite);
  if (nonOppositePredictions.length > 0) {
    return nonOppositePredictions[0].direction;
  }
  
  // Absolute last resort: just take the highest value
  return sortedPredictions[0].direction;
};
