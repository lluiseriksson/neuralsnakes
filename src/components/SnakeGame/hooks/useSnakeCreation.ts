
import { Direction, Snake } from '../types';
import { NeuralNetwork } from '../NeuralNetwork';
import { generateInitialSnake } from '../snakeMovement';

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  let brain: NeuralNetwork;
  
  // Try to load the best model or combine existing models if available
  if (id === 0) {
    // Primera serpiente: intentar cargar el mejor modelo
    const bestModel = await NeuralNetwork.loadBest();
    if (bestModel) {
      console.log(`Usando el mejor modelo (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
      // Clone with mutations to evolve
      brain = bestModel.clone(0.1);
    } else {
      brain = new NeuralNetwork(8, 12, 4);
    }
  } else if (id === 1) {
    // Segunda serpiente: combinar los mejores modelos (si hay suficientes)
    const combinedModel = await NeuralNetwork.combineModels(5);
    if (combinedModel) {
      console.log(`Usando modelo combinado (generación ${combinedModel.getGeneration()})`);
      brain = combinedModel;
    } else {
      brain = new NeuralNetwork(8, 12, 4);
    }
  } else {
    // Crear una red neuronal nueva con mutaciones aleatorias para probar estrategias diferentes
    brain = new NeuralNetwork(8, 12, 4);
    brain.mutate(0.2); // Más mutación para más exploración
  }

  return {
    id,
    positions: generateInitialSnake(x, y),
    direction,
    color,
    score: 0,
    brain,
    alive: true
  };
};

export const generateSnakeSpawnConfig = (snakeId: number): [number, number, Direction, string] => {
  const positions: [number, number][] = [[5, 5], [25, 25], [5, 25], [25, 5]];
  const directions: Direction[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const colors = ['yellow', 'blue', 'green', '#9b87f5'];
  
  return [positions[snakeId][0], positions[snakeId][1], directions[snakeId], colors[snakeId]];
};
