
import { Snake } from '../types';
import { createSnake, generateSnakeSpawnConfig } from '../hooks/snakeCreation';
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
  
  // Keep track of the number of dead snakes for logging
  let deadCount = 0;
  
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    
    if (!snake.alive) {
      deadCount++;
      console.log(`Respawning dead snake ${snake.id} (${snake.color})`);
      
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
      updatedSnakes[i].alive = true; // Critical: Set alive to true immediately
      updatedSnakes[i].score = 0; // Reset score for respawned snake
      
      console.log(`Snake ${snake.id} (${color}) temporarily respawned at (${spawnX},${spawnY})`);
      
      // Prevent double-respawning by using a closure to capture the current value of i
      ((snakeIndex) => {
        // Schedule full respawn after a shorter delay (500ms instead of 1000ms)
        setTimeout(() => {
          try {
            createSnake(snake.id, spawnX, spawnY, direction, color)
              .then(newSnake => {
                if (newSnake && newSnake.brain) {
                  // Update the snake with new properties while keeping the reference
                  Object.assign(updatedSnakes[snakeIndex], newSnake);
                  updatedSnakes[snakeIndex].alive = true; // Ensure alive is set again
                  updatedSnakes[snakeIndex].score = 0; // Reset score again to be sure
                  console.log(`Snake ${snake.id} (${color}) fully respawned with generation ${newSnake.brain.getGeneration()}`);
                } else {
                  console.error(`Created snake ${snake.id} has invalid brain, keeping fallback values`);
                }
              })
              .catch(error => {
                console.error(`Error respawning snake ${snake.id}:`, error);
                // Snake already has fallback values set above, so it should still be visible
                console.log(`Snake ${snake.id} will continue with fallback values`);
              });
          } catch (error) {
            console.error(`Exception during respawn of snake ${snake.id}:`, error);
          }
        }, 500); // Reduced delay for faster respawn
      })(i);
    }
  }
  
  if (deadCount > 0) {
    console.log(`Respawned ${deadCount} dead snakes. ${updatedSnakes.filter(s => s.alive).length} snakes are now alive.`);
  }
  
  return updatedSnakes;
};
