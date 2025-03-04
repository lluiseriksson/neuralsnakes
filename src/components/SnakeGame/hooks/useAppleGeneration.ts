
import { Apple, GameState } from '../types';
import { GRID_SIZE } from '../constants';

export const generateApple = (index: number = 0): Apple => {
  return {
    id: Date.now() + index, // Add a unique id
    position: {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  };
};

// Fixed function to generate apples that don't collide with snakes
export const generateNonCollidingApple = (
  snakes: GameState['snakes'],
  existingApples: GameState['apples'],
  index: number = 0
): Apple => {
  const newApple = generateApple(index);
  
  // Check for collision with snakes
  const collidesWithSnake = snakes.some(snake => {
    return snake.positions.some(segment => 
      segment.x === newApple.position.x && segment.y === newApple.position.y
    );
  });
  
  // Check for collision with existing apples
  const collidesWithApple = existingApples.some(apple => 
    apple.position.x === newApple.position.x && apple.position.y === newApple.position.y
  );
  
  // If collision detected, try again with recursion (with limit to prevent infinite loop)
  if ((collidesWithSnake || collidesWithApple) && index < 50) {
    return generateNonCollidingApple(snakes, existingApples, index + 1);
  }
  
  return newApple;
};
