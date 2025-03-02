
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
  
  // FIXED: Log predictions for debugging
  console.log(`Snake ${snake.id} (gen: ${snake.brain.getGeneration()}) predictions:`, 
    directions.map((dir, i) => `${dir}: ${predictions[i].toFixed(3)}`).join(', '));
  
  // Create a sorted list of directions by prediction value
  const sortedPredictions = directions.map((dir, index) => ({
    direction: dir,
    value: predictions[index],
    isOpposite: isOppositeDirection(snake.direction, dir),
    isObstacle: adjacentObstacles.some(obs => obs.dir === dir)
  })).sort((a, b) => b.value - a.value);
  
  // FIXED: Print sorted predictions to help debugging
  console.log(`Snake ${snake.id} sorted directions:`, 
    sortedPredictions.map(p => 
      `${p.direction}: ${p.value.toFixed(2)}${p.isOpposite ? ' (opposite)' : ''}${p.isObstacle ? ' (obstacle)' : ''}`
    ).join(', '));
  
  // Safety check: Give preference to safe directions that aren't opposite
  // First try directions that have no obstacles and aren't opposite to current direction
  const safePredictions = sortedPredictions.filter(p => !p.isObstacle && !p.isOpposite);
  
  if (safePredictions.length > 0) {
    console.log(`Snake ${snake.id} using safe direction: ${safePredictions[0].direction}`);
    return safePredictions[0].direction;
  }
  
  // If all directions have obstacles or are opposite, prioritize avoiding obstacles
  const nonObstaclePredictions = sortedPredictions.filter(p => !p.isObstacle);
  if (nonObstaclePredictions.length > 0) {
    console.log(`Snake ${snake.id} using non-obstacle direction: ${nonObstaclePredictions[0].direction}`);
    return nonObstaclePredictions[0].direction;
  }
  
  // If all directions have obstacles, choose the one with highest value that isn't opposite
  const nonOppositePredictions = sortedPredictions.filter(p => !p.isOpposite);
  if (nonOppositePredictions.length > 0) {
    console.log(`Snake ${snake.id} using non-opposite direction: ${nonOppositePredictions[0].direction}`);
    return nonOppositePredictions[0].direction;
  }
  
  // Absolute last resort: just take the highest value
  console.log(`Snake ${snake.id} using last resort direction: ${sortedPredictions[0].direction}`);
  return sortedPredictions[0].direction;
};
