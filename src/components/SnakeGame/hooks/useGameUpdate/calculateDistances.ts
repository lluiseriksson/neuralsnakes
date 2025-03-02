
import { GameState, Snake, Position } from '../../types';

/**
 * Calculate the current distance to the closest apple for a snake
 */
export const calculateDistanceToClosestApple = (head: Position, apples: GameState['apples']): number => {
  if (!apples.length) return Infinity;
  
  let minDistance = Infinity;
  
  for (const apple of apples) {
    const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
};

/**
 * Calculate distances to closest apples for all snakes
 */
export const calculatePreviousDistances = (snakes: Snake[], apples: GameState['apples']): number[] => {
  return snakes.map(snake => {
    if (!snake.alive || !apples.length) return Infinity;
    
    const head = snake.positions[0];
    return calculateDistanceToClosestApple(head, apples);
  });
};
