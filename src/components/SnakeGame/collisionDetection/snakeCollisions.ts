
import { Snake } from '../types';
import { applyNegativeLearning } from './learningEffects';

/**
 * Checks for collisions between a snake and itself
 */
export const checkSelfCollision = (snake: Snake): boolean => {
  if (!snake.alive) return false;
  
  const head = snake.positions[0];
  
  // Check collision with its own body (excluding the head)
  for (let j = 1; j < snake.positions.length; j++) {
    if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
      console.log(`Snake ${snake.id} collided with itself at (${head.x}, ${head.y})`);
      
      // Update suicide metrics
      if (snake.decisionMetrics) {
        snake.decisionMetrics.suicides = (snake.decisionMetrics.suicides || 0) + 1;
      }
      
      return true;
    }
  }
  
  return false;
};

/**
 * Checks for collisions between snakes
 */
export const checkSnakeCollisions = (snakes: Snake[]): Snake[] => {
  const updatedSnakes = [...snakes];
  
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];
    
    // Check for head-to-body collisions with other snakes
    for (let j = 0; j < updatedSnakes.length; j++) {
      if (i === j || !updatedSnakes[j].alive) continue;
      
      const otherSnake = updatedSnakes[j];
      
      for (let k = 0; k < otherSnake.positions.length; k++) {
        const segment = otherSnake.positions[k];
        
        if (head.x === segment.x && head.y === segment.y) {
          console.log(`Snake ${snake.id} collided with snake ${otherSnake.id} at (${head.x}, ${head.y})`);
          
          if (k === 0) {
            // Head-to-head collision
            // Apply learning to both snakes
            applyNegativeLearning(snake, 2.0);
            applyNegativeLearning(otherSnake, 2.0);
            
            // Mark both snakes as dead
            snake.alive = false;
            otherSnake.alive = false;
            
            // Log final scores
            console.log(`Snake ${snake.id} died in head-to-head collision. Final score: ${snake.score}`);
            console.log(`Snake ${otherSnake.id} died in head-to-head collision. Final score: ${otherSnake.score}`);
            
            // Count as death for both
            if (snake.decisionMetrics) {
              snake.decisionMetrics.suicides = (snake.decisionMetrics.suicides || 0) + 1;
            }
            if (otherSnake.decisionMetrics) {
              otherSnake.decisionMetrics.suicides = (otherSnake.decisionMetrics.suicides || 0) + 1;
            }
          } else {
            // Head-to-body collision
            // Apply learning to the colliding snake
            applyNegativeLearning(snake, 2.0);
            
            // The colliding snake dies
            snake.alive = false;
            console.log(`Snake ${snake.id} died from colliding with snake ${otherSnake.id}. Final score: ${snake.score}`);
            
            // The other snake gets the points
            const scoreToAdd = Math.max(1, Math.floor(snake.positions.length / 2));
            otherSnake.score += scoreToAdd;
            console.log(`Snake ${otherSnake.id} gained ${scoreToAdd} points. New score: ${otherSnake.score}`);
            
            // Update the brain's score record
            if (otherSnake.brain && typeof otherSnake.brain.setScore === 'function') {
              otherSnake.brain.setScore(otherSnake.score);
            }
            
            // The total segments to add is proportional to the score
            const totalSegmentsToAdd = Math.min(3, snake.positions.length);
            
            // Track kill for the surviving snake
            if (otherSnake.decisionMetrics) {
              otherSnake.decisionMetrics.killCount = (otherSnake.decisionMetrics.killCount || 0) + 1;
            }
            
            // Add segments to the surviving snake
            for (let n = 0; n < totalSegmentsToAdd; n++) {
              otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
            }
          }
          
          break;
        }
      }
      
      // If the snake is no longer alive, stop checking other collisions
      if (!snake.alive) break;
    }
  }
  
  return updatedSnakes;
};
