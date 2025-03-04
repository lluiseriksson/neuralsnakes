import { Snake } from '../types';
import { createSnake, generateSnakeSpawnConfig } from '../hooks/snakeCreation';
import { incrementGeneration } from '../hooks/snakeCreation/modelCache';

/**
 * Handle respawning of dead snakes
 */
export const handleRespawn = (snakes: Snake[]): Snake[] => {
  const updatedSnakes = [...snakes];
  
  // Only respawn if dead snakes exist and some snakes are still alive
  const deadSnakes = updatedSnakes.filter(snake => !snake.alive);
  const allDead = updatedSnakes.every(snake => !snake.alive);
  
  // If no dead snakes or all snakes are alive, nothing to do
  if (deadSnakes.length === 0) {
    return updatedSnakes;
  }
  
  // Check if all snakes are dead - if so, increment generation
  if (allDead) {
    console.log("All snakes are dead - forcing generation increment");
    incrementGeneration();
  }
  
  // Keep track of the number of dead snakes for logging
  let deadCount = 0;
  
  for (let i = 0; i < updatedSnakes.length; i++) {
    const snake = updatedSnakes[i];
    
    // Only process dead snakes
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
      updatedSnakes[i] = {
        ...snake,
        positions: fallbackPositions,
        direction: direction,
        color: color,
        alive: true, // Critical: Set alive to true immediately
        score: 0, // Reset score for respawned snake
        movesWithoutEating: 0 // Reset movesWithoutEating counter
      };
      
      console.log(`Snake ${snake.id} (${color}) temporarily respawned at (${spawnX},${spawnY})`);
      
      // Prevent double-respawning by using a closure to capture the current value of i
      ((snakeIndex) => {
        // Schedule full respawn after a shorter delay (500ms instead of 1000ms)
        setTimeout(() => {
          try {
            createSnake(snake.id, spawnX, spawnY, direction, color)
              .then(newSnake => {
                if (newSnake && newSnake.brain) {
                  // Make a copy of the current snake's object to avoid reference issues
                  const currentSnake = {...updatedSnakes[snakeIndex]};
                  
                  // Only update the snake if it's still dead or just respawned
                  // This prevents overwriting a snake that might be alive and playing
                  if (!currentSnake.alive || currentSnake.score === 0) {
                    // Update the snake with new properties but keep the object reference
                    Object.assign(updatedSnakes[snakeIndex], newSnake);
                    updatedSnakes[snakeIndex].alive = true;
                    updatedSnakes[snakeIndex].score = 0;
                    updatedSnakes[snakeIndex].movesWithoutEating = 0;
                    console.log(`Snake ${snake.id} (${color}) fully respawned with generation ${newSnake.brain.getGeneration()}`);
                  } else {
                    console.log(`Snake ${snake.id} is already alive with score ${currentSnake.score}, skipping full respawn`);
                  }
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
