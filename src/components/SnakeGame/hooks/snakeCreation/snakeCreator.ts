
import { Direction, Snake } from '../../types';
import { generateInitialSnake } from '../../snakeMovement';
import { createBestModelBrain, createCombinedModelBrain, createRandomBrain } from './createSnakeBrain';

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creando serpiente ${id} en posición (${x},${y})`);
    let brain;
    
    // Select the appropriate brain creation strategy based on snake ID
    if (id === 0) {
      brain = await createBestModelBrain();
    } else if (id === 1) {
      brain = await createCombinedModelBrain();
    } else {
      brain = createRandomBrain(id);
    }

    // Generate initial positions
    const positions = generateInitialSnake(x, y);
    
    if (!positions || positions.length === 0) {
      console.error(`Error al generar posiciones iniciales para serpiente ${id}`);
      // Create simple initial positions as fallback
      const fallbackPositions = [
        { x, y },
        { x, y: y + 1 },
        { x, y: y + 2 }
      ];
      console.log(`Usando posiciones de respaldo para serpiente ${id}`);
      
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
    
    console.log(`Serpiente ${id} creada en (${x}, ${y}) con ${positions.length} segmentos y generación ${brain.getGeneration()}`);

    return {
      id,
      positions: positions,
      direction,
      color,
      score: 0,
      brain,
      alive: true,
      gridSize: 30
    };
  } catch (error) {
    console.error(`Error al crear serpiente ${id}:`, error);
    // Create a snake with default values in case of error
    const fallbackPositions = [
      { x, y },
      { x, y: y + 1 },
      { x, y: y + 2 }
    ];
    console.log(`Creando serpiente fallback para ${id}`);
    
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
