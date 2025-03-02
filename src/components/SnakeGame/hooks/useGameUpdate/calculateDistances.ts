
import { GameState, Snake, Position } from '../../types';

/**
 * Calculate the current distance to the closest apple for a snake
 */
export const calculateDistanceToClosestApple = (head: Position, apples: GameState['apples']): number => {
  if (!apples.length) return Infinity;
  
  let minDistance = Infinity;
  let closestApple = null;
  
  for (const apple of apples) {
    const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestApple = apple;
    }
  }
  
  // Log for visualization
  if (closestApple) {
    console.log(`Distance to closest apple: ${minDistance}`, {
      head,
      closestApple: closestApple.position
    });
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

/**
 * Get detailed distance information for visualization
 */
export const getDistanceVisualizationInfo = (head: Position, apples: GameState['apples']) => {
  if (!apples.length) return { closestDistance: Infinity, appleDistances: [] };
  
  const appleDistances = apples.map(apple => ({
    position: {...apple.position},
    distance: Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y)
  })).sort((a, b) => a.distance - b.distance);
  
  return {
    closestDistance: appleDistances[0]?.distance || Infinity,
    closestApple: appleDistances[0]?.position || null,
    appleDistances
  };
};
