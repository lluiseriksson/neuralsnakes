
import { Direction, Snake, NeuralNetwork as INeuralNetwork } from '../types';
import { NeuralNetwork } from '../NeuralNetwork';
import { generateInitialSnake } from '../snakeMovement';

// Cache para evitar cargar modelos repetidamente
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creando serpiente ${id} en posición (${x},${y})`);
    let brain: INeuralNetwork;
    
    // Usar cache para optimizar la carga de modelos
    if (id === 0) {
      // Primera serpiente: intentar usar el modelo en cache o cargar el mejor
      if (bestModelCache) {
        console.log(`Usando modelo en cache (generación ${bestModelCache.getGeneration()})`);
        brain = bestModelCache.clone(0.1);
      } else {
        console.log("Cargando el mejor modelo...");
        try {
          const bestModel = await NeuralNetwork.loadBest();
          if (bestModel) {
            bestModelCache = bestModel; // Almacenar en cache
            console.log(`Modelo cargado (generación ${bestModel.getGeneration()})`);
            brain = bestModel.clone(0.1);
          } else {
            console.log("No se encontró un modelo existente, creando uno nuevo");
            brain = new NeuralNetwork(8, 12, 4);
            bestModelCache = brain; // Cache el modelo nuevo también
          }
        } catch (loadError) {
          console.error("Error cargando el mejor modelo:", loadError);
          brain = new NeuralNetwork(8, 12, 4);
          bestModelCache = brain;
        }
      }
    } else if (id === 1) {
      // Segunda serpiente: usar cache o combinar modelos
      if (combinedModelCache) {
        console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
        brain = combinedModelCache.clone(0.05);
      } else {
        console.log("Creando un nuevo modelo para la serpiente 1");
        brain = new NeuralNetwork(8, 12, 4);
        combinedModelCache = brain; // Cache el modelo nuevo
      }
    } else {
      // Crear una red neuronal nueva con mutaciones aleatorias
      console.log(`Creando un nuevo modelo para la serpiente ${id}`);
      brain = new NeuralNetwork(8, 12, 4);
      brain.mutate(0.2);
    }

    // Generar posiciones iniciales
    const positions = generateInitialSnake(x, y);
    
    if (!positions || positions.length === 0) {
      console.error(`Error al generar posiciones iniciales para serpiente ${id}`);
      // Crear posiciones iniciales simples como fallback
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
    
    console.log(`Serpiente ${id} creada en (${x}, ${y}) con ${positions.length} segmentos`);

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
    // Crear una serpiente con valores por defecto en caso de error
    const fallbackPositions = [
      { x, y },
      { x, y: y + 1 },
      { x, y: y + 2 }
    ];
    console.log(`Creando serpiente fallback para ${id}`);
    
    return {
      id,
      positions: fallbackPositions,
      direction,
      color,
      score: 0,
      brain: new NeuralNetwork(8, 12, 4),
      alive: true,
      gridSize: 30
    };
  }
};

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const colors = ['yellow', 'blue', 'green', '#9b87f5'];
  
  return [positions[snakeId][0], positions[snakeId][1], directions[snakeId], colors[snakeId]];
};
