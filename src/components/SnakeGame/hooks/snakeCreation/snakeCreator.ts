
import { Direction, Snake } from '../../types';
import { generateInitialSnake } from '../../movement/initialSnake';
import { createBestModelBrain, createCombinedModelBrain, createRandomBrain } from './createSnakeBrain';
import { getModelCache, forceGenerationUpdate } from './modelCache';

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creating snake ${id} at position (${x},${y}) with color ${color}`);
    let brain;
    
    // Select the appropriate brain creation strategy based on snake ID
    if (id === 0) {
      // Yellow snake - best model brain
      console.log(`Creating best model brain for yellow snake ${id} with color ${color}`);
      brain = await createBestModelBrain().catch(error => {
        console.error(`Error creating best model brain: ${error.message}`);
        return createRandomBrain(id);
      });
      
      // FIXED: Log the generation of yellow snake for debugging
      console.log(`YELLOW SNAKE GENERATION CHECK: ${brain.getGeneration()}`);
      
      // FIXED: Force generation update from yellow snake to ensure it's spreading to other snakes
      const yellowSnakeGeneration = brain.getGeneration();
      if (yellowSnakeGeneration > 0) {
        forceGenerationUpdate(yellowSnakeGeneration);
      }
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

    // Generate initial positions - con comprobación de seguridad
    let positions = generateInitialSnake(x, y);
    
    // Verificar que las posiciones son válidas
    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      console.error(`Error generating initial positions for snake ${id}, using fallback`);
      // Create simple initial positions as fallback
      positions = [
        { x, y },
        { x, y: y + 1 },
        { x, y: y + 2 }
      ];
      console.log(`Using fallback positions for snake ${id}`);
    }
    
    // Verificar que cada posición es válida
    for (let i = 0; i < positions.length; i++) {
      if (typeof positions[i].x !== 'number' || typeof positions[i].y !== 'number') {
        console.error(`Invalid position at index ${i} for snake ${id}, fixing`);
        positions[i] = { x: x + i, y };
      }
    }
    
    // Inicializar métricas de decisión para mejor análisis
    const decisionMetrics = {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0
    };
    
    console.log(`Snake ${id} created at (${x}, ${y}) with ${positions.length} segments and generation ${brain.getGeneration()}`);

    return {
      id,
      positions,
      direction,
      color,
      score: 0,
      brain,
      alive: true,
      gridSize: 30,
      movesWithoutEating: 0,
      decisionMetrics
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
      gridSize: 30,
      movesWithoutEating: 0,
      decisionMetrics: {
        applesEaten: 0,
        applesIgnored: 0,
        badDirections: 0,
        goodDirections: 0
      }
    };
  }
};
