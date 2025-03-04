
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
  
  // First, identify all head-to-head collisions
  const headToHeadCollisions = new Set<number>();
  
  // Detect head-to-head collisions first
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];
    
    for (let j = i + 1; j < updatedSnakes.length; j++) {
      const otherSnake = updatedSnakes[j];
      if (!otherSnake.alive) continue;
      
      const otherHead = otherSnake.positions[0];
      
      // Check for head-to-head collision
      if (head.x === otherHead.x && head.y === otherHead.y) {
        headToHeadCollisions.add(i);
        headToHeadCollisions.add(j);
        
        console.log(`Head-to-head collision detected between Snake ${snake.id} and Snake ${otherSnake.id}`);
      }
    }
  }
  
  // Process all other collisions
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    if (!snake.alive || headToHeadCollisions.has(i)) continue;
    
    const head = snake.positions[0];
    
    // Check for head-to-body collisions with other snakes
    for (let j = 0; j < updatedSnakes.length; j++) {
      if (i === j || !updatedSnakes[j].alive || headToHeadCollisions.has(j)) continue;
      
      const otherSnake = updatedSnakes[j];
      
      // Skip the head for non-head-to-head collisions
      for (let k = 1; k < otherSnake.positions.length; k++) {
        const segment = otherSnake.positions[k];
        
        if (head.x === segment.x && head.y === segment.y) {
          console.log(`Snake ${snake.id} collided with snake ${otherSnake.id} at (${head.x}, ${head.y})`);
          
          // Store the original score and length before collision for debugging
          const originalScore = snake.score;
          const originalLength = snake.positions.length;
          
          // Apply learning to the colliding snake
          applyNegativeLearning(snake, 2.0);
          
          // The colliding snake dies
          snake.alive = false;
          console.log(`Snake ${snake.id} died from colliding with snake ${otherSnake.id}. Final score: ${snake.score} (from ${originalLength} segments)`);
          
          // The other snake gets the points
          const scoreToAdd = Math.max(1, Math.floor(snake.positions.length / 2));
          
          // Store the original values before updating
          const otherOriginalScore = otherSnake.score;
          const otherOriginalLength = otherSnake.positions.length;
          
          otherSnake.score += scoreToAdd;
          console.log(`Snake ${otherSnake.id} gained ${scoreToAdd} points. New score: ${otherSnake.score} (from ${otherOriginalScore})`);
          
          // Update the brain's score record
          if (otherSnake.brain && typeof otherSnake.brain.setScore === 'function') {
            otherSnake.brain.setScore(otherSnake.score);
          }
          
          // The total segments to add is equal to the length of the killed snake
          const segmentsToAdd = Math.max(1, Math.floor(snake.positions.length / 2));
          console.log(`Snake ${otherSnake.id} will grow by ${segmentsToAdd} segments (from ${otherOriginalLength} to ${otherSnake.positions.length + segmentsToAdd})`);
          
          // Track kill for the surviving snake
          if (otherSnake.decisionMetrics) {
            otherSnake.decisionMetrics.killCount = (otherSnake.decisionMetrics.killCount || 0) + 1;
          }
          
          // Add segments to the surviving snake
          const lastSegment = otherSnake.positions[otherSnake.positions.length - 1];
          for (let n = 0; n < segmentsToAdd; n++) {
            otherSnake.positions.push({ ...lastSegment });
          }
          console.log(`Snake ${otherSnake.id} grew to ${otherSnake.positions.length} segments`);
          
          // Update score based on new length - ensure it's consistent with length
          otherSnake.score = otherSnake.positions.length - 3;
          console.log(`Snake ${otherSnake.id} final score adjusted to ${otherSnake.score} based on ${otherSnake.positions.length} segments`);
          
          break;
        }
      }
      
      // If the snake is no longer alive, stop checking other collisions
      if (!snake.alive) break;
    }
  }
  
  // Process the head-to-head collisions last
  Array.from(headToHeadCollisions).forEach(index => {
    const snake = updatedSnakes[index];
    
    // Store original values for debugging
    const originalScore = snake.score;
    const originalLength = snake.positions.length;
    
    // Apply learning to all snakes in head-to-head collisions
    applyNegativeLearning(snake, 2.0);
    
    // Mark snake as dead
    snake.alive = false;
    
    // Log final scores
    console.log(`Snake ${snake.id} died in head-to-head collision. Final score: ${snake.score} (from ${originalLength} segments)`);
    
    // Count as suicide
    if (snake.decisionMetrics) {
      snake.decisionMetrics.suicides = (snake.decisionMetrics.suicides || 0) + 1;
    }
  });
  
  return updatedSnakes;
};
