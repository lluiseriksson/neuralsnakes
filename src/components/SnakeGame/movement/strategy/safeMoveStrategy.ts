
import { Snake, Position, Direction, GameState } from "../../types";
import { GRID_SIZE } from "../../constants";
import { isOppositeDirection } from "../directionUtils";
import { wouldCollide } from "../collision";
import { isAppleInDirection } from "../appleDetection";

// Function to find a safe direction when the snake is in danger of collision
export const findSafeDirection = (snake: Snake, gameState: GameState, currentPrediction: number[]): Direction => {
  if (!snake.positions || snake.positions.length === 0) return snake.direction;
  
  const head = snake.positions[0];
  const gridSize = snake.gridSize || GRID_SIZE;
  
  // Define all possible directions and their corresponding new heads
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  const newHeads: {direction: Direction, head: Position, score: number, hasApple: boolean}[] = [
    { 
      direction: 'UP', 
      head: { x: head.x, y: (head.y - 1 + gridSize) % gridSize },
      score: currentPrediction[0] || 0,
      hasApple: isAppleInDirection(head, 'UP', gameState, gridSize)
    },
    { 
      direction: 'RIGHT', 
      head: { x: (head.x + 1) % gridSize, y: head.y },
      score: currentPrediction[1] || 0,
      hasApple: isAppleInDirection(head, 'RIGHT', gameState, gridSize)
    },
    { 
      direction: 'DOWN', 
      head: { x: head.x, y: (head.y + 1) % gridSize },
      score: currentPrediction[2] || 0,
      hasApple: isAppleInDirection(head, 'DOWN', gameState, gridSize)
    },
    { 
      direction: 'LEFT', 
      head: { x: (head.x - 1 + gridSize) % gridSize, y: head.y },
      score: currentPrediction[3] || 0,
      hasApple: isAppleInDirection(head, 'LEFT', gameState, gridSize)
    }
  ];
  
  // Filter out opposite direction
  const possibleMoves = newHeads.filter(move => !isOppositeDirection(snake.direction, move.direction));
  
  // Check which moves are safe (don't result in collision)
  let safeMoves = possibleMoves.filter(move => !wouldCollide(move.head, snake, gameState));
  
  // Prioritize safe moves with apples
  const safeMovesWithApples = safeMoves.filter(move => move.hasApple);
  if (safeMovesWithApples.length > 0) {
    // Choose the safe move with apple that has the highest score
    safeMovesWithApples.sort((a, b) => b.score - a.score);
    return safeMovesWithApples[0].direction;
  }
  
  if (safeMoves.length === 0) {
    // No safe moves, just try to avoid the opposite direction
    console.log(`No safe moves for snake ${snake.id}, trying to avoid opposite direction`);
    return possibleMoves.length > 0 ? possibleMoves[0].direction : snake.direction;
  }
  
  // Sort safe moves by their neural network score (higher is better)
  safeMoves.sort((a, b) => b.score - a.score);
  
  // Return the direction with the highest score
  return safeMoves[0].direction;
};
