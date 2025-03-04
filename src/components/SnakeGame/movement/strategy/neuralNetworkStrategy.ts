
import { Snake, Direction } from "../../types";
import { evaluateDirections } from "./directionEvaluation";
import { makeDirectionDecision } from "./directionDecision";

/**
 * Function to get the neural network's recommended direction with enhanced decision-making
 */
export const getNeuralNetworkDirection = (
  snake: Snake, 
  predictions: number[],
  adjacentObstacles: Array<{pos: {x: number, y: number}, dir: Direction}>
): Direction | null => {
  if (!predictions || predictions.length !== 4) return null;
  
  // Step 1: Evaluate all possible directions
  const directionEvaluations = evaluateDirections(snake, predictions, adjacentObstacles);
  
  // Step 2: Sort by final adjusted score, highest first
  const sortedEvaluations = [...directionEvaluations].sort((a, b) => 
    b.adjustedScore - a.adjustedScore
  );
  
  // Step 3: Make the final decision based on the evaluations
  return makeDirectionDecision(snake, sortedEvaluations);
};
