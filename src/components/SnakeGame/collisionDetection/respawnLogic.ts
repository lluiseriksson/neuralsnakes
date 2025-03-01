import { Snake } from '../types';
import { createSnake, generateSnakeSpawnConfig } from '../hooks/useSnakeCreation';

/**
 * Handle respawning of dead snakes
 */
export const handleRespawn = (snakes: Snake[]): Snake[] => {
  const updatedSnakes = [...snakes];
  
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    
    if (!snake.alive) {
      // Generate respawn configuration
      const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
      
      // Schedule respawn after a delay
      setTimeout(() => {
        createSnake(snake.id, spawnX, spawnY, direction, color)
          .then(newSnake => {
            // Update the snake with new properties while keeping the reference
            Object.assign(updatedSnakes[i], newSnake);
            updatedSnakes[i].alive = true;
          });
      }, 1000);
    }
  }
  
  return updatedSnakes;
};
