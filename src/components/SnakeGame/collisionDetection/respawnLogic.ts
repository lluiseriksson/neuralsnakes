
import { Snake } from '../types';
import { createSnake, generateSnakeSpawnConfig } from '../hooks/useSnakeCreation';
import { incrementGeneration } from '../hooks/snakeCreation/modelCache';

/**
 * Handle respawning of dead snakes
 */
export const handleRespawn = (snakes: Snake[]): Snake[] => {
  const updatedSnakes = [...snakes];
  
  // Check if all snakes are dead - if so, increment generation
  const allDead = updatedSnakes.every(snake => !snake.alive);
  if (allDead) {
    console.log("All snakes are dead - forcing generation increment");
    incrementGeneration();
  }
  
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
            console.log(`Snake ${snake.id} respawned with generation ${newSnake.brain.getGeneration()}`);
          })
          .catch(error => {
            console.error(`Error respawning snake ${snake.id}:`, error);
            // Try again with default settings
            const fallbackPositions = [
              { x: spawnX, y: spawnY },
              { x: spawnX, y: spawnY + 1 },
              { x: spawnX, y: spawnY + 2 }
            ];
            updatedSnakes[i].positions = fallbackPositions;
            updatedSnakes[i].direction = direction;
            updatedSnakes[i].alive = true;
          });
      }, 1000);
    }
  }
  
  return updatedSnakes;
};
