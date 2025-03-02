import { Direction, Snake } from '../../types';
import { generateInitialSnake } from '../../snakeMovement';
import { createBestModelBrain, createCombinedModelBrain, createRandomBrain } from './createSnakeBrain';

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creating snake ${id} at position (${x},${y}) with color ${color}`);
    let brain;
    
    // Select the appropriate brain creation strategy based on snake ID
    if (id === 0) {
      // Yellow snake - best model brain
      console.log(`Creating best model brain for yellow snake ${id}`);
      brain = await createBestModelBrain().catch(error => {
        console.error(`Error creating best model brain: ${error.message}`);
        return createRandomBrain(id);
      });
    } else if (id === 1) {
      // Blue snake - combined model brain
      console.log(`Creating combined model brain for blue snake ${id}`);
      brain = await createCombinedModelBrain().catch(error => {
        console.error(`Error creating combined model brain: ${error.message}`);
        return createRandomBrain(id);
      });
    } else {
      // Other snakes - random brains
      console.log(`Creating random brain for snake ${id}`);
      brain = createRandomBrain(id);
    }

    if (!brain) {
      console.error(`Failed to create brain for snake ${id}, creating fallback random brain`);
      brain = createRandomBrain(id);
    }

    // Generate initial positions
    const positions = generateInitialSnake(x, y);
    
    if (!positions || positions.length === 0) {
      console.error(`Error generating initial positions for snake ${id}`);
      // Create simple initial positions as fallback
      const fallbackPositions = [
        { x, y },
        { x, y: y + 1 },
        { x, y: y + 2 }
      ];
      console.log(`Using fallback positions for snake ${id}`);
      
      return {
        id,
        positions: fallbackPositions,
        direction,
        color,
        score: 0,
        brain,
        alive: true,
        gridSize: 30
      };
    }
    
    console.log(`Snake ${id} created at (${x}, ${y}) with ${positions.length} segments and generation ${brain.getGeneration()}`);

    return {
      id,
      positions,
      direction,
      color,
      score: 0,
      brain,
      alive: true,
      gridSize: 30
    };
  } catch (error) {
    console.error(`Error creating snake ${id}:`, error);
    // Create a snake with default values in case of error
    const fallbackPositions = [
      { x, y },
      { x, y: y + 1 },
      { x, y: y + 2 }
    ];
    console.log(`Creating fallback snake for ${id}`);
    
    // Create fallback brain
    const fallbackBrain = createRandomBrain(id);
    
    return {
      id,
      positions: fallbackPositions,
      direction,
      color,
      score: 0,
      brain: fallbackBrain,
      alive: true,
      gridSize: 30
    };
  }
};
