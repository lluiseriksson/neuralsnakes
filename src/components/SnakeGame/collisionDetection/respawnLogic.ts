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
      
      // Create a new snake immediately with fallback positions
      const fallbackPositions = [
        { x: spawnX, y: spawnY },
        { x: spawnX, y: spawnY + 1 },
        { x: spawnX, y: spawnY + 2 }
      ];
      
      // Update the snake with basic fallback values for immediate display
      updatedSnakes[i].positions = fallbackPositions;
      updatedSnakes[i].direction = direction;
      updatedSnakes[i].color = color;
      updatedSnakes[i].alive = true;
      
      // Schedule full respawn after a delay
      setTimeout(() => {
        createSnake(snake.id, spawnX, spawnY, direction, color)
          .then(newSnake => {
            if (newSnake && newSnake.brain) {
              // Update the snake with new properties while keeping the reference
              Object.assign(updatedSnakes[i], newSnake);
              updatedSnakes[i].alive = true;
              console.log(`Snake ${snake.id} respawned with generation ${newSnake.brain.getGeneration()}`);
            } else {
              console.error(`Created snake ${snake.id} has invalid brain`);
            }
          })
          .catch(error => {
            console.error(`Error respawning snake ${snake.id}:`, error);
            // Snake already has fallback values set above
          });
      }, 1000);
    }
  }
  
  return updatedSnakes;
};
