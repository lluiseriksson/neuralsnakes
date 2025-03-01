
import { Direction, Snake, NeuralNetwork as INeuralNetwork } from '../types';
import { NeuralNetwork } from '../NeuralNetwork';
import { generateInitialSnake } from '../snakeMovement';

// Cache para evitar cargar modelos repetidamente
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    let brain: INeuralNetwork;
    
    // Usar cache para optimizar la carga de modelos
    if (id === 0) {
      // Primera serpiente: intentar usar el modelo en cache o cargar el mejor
      if (bestModelCache) {
        console.log(`Usando modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
        brain = bestModelCache.clone(0.1);
      } else {
        console.log("Cargando el mejor modelo...");
        const bestModel = await NeuralNetwork.loadBest();
        if (bestModel) {
          bestModelCache = bestModel; // Almacenar en cache
          console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
          brain = bestModel.clone(0.1);
        } else {
          console.log("No se encontró un modelo existente, creando uno nuevo");
          brain = new NeuralNetwork(8, 12, 4);
          bestModelCache = brain; // Cache el modelo nuevo también
        }
      }
    } else if (id === 1) {
      // Segunda serpiente: usar cache o combinar modelos
      if (combinedModelCache) {
        console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
        brain = combinedModelCache.clone(0.05);
      } else {
        console.log("Combinando modelos...");
        const combinedModel = await NeuralNetwork.combineModels(3); // Reducir de 5 a 3 para mejorar rendimiento
        if (combinedModel) {
          combinedModelCache = combinedModel; // Almacenar en cache
          console.log(`Modelo combinado (generación ${combinedModel.getGeneration()})`);
          brain = combinedModel;
        } else {
          console.log("No hay suficientes modelos para combinar, creando uno nuevo");
          brain = new NeuralNetwork(8, 12, 4);
          combinedModelCache = brain; // Cache el modelo nuevo
        }
      }
    } else {
      // Crear una red neuronal nueva con mutaciones aleatorias
      console.log(`Creando un nuevo modelo para la serpiente ${id}`);
      if (bestModelCache) {
        // Usar el mejor modelo como base y mutarlo para mayor eficiencia
        brain = bestModelCache.clone(0.2);
      } else {
        brain = new NeuralNetwork(8, 12, 4);
        brain.mutate(0.2);
      }
    }

    const positions = generateInitialSnake(x, y);
    console.log(`Serpiente ${id} creada en (${x}, ${y}) con dirección ${direction} y ${positions.length} segmentos`);

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
    return {
      id,
      positions: generateInitialSnake(x, y),
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
