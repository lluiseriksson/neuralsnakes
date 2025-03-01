
import { Snake, Position, Direction, GameState, NeuralNetwork } from "./types";
import { GRID_SIZE } from "./constants";
import { supabase } from "@/integrations/supabase/client";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  return [
    { x, y },
    { x, y: y + 1 },
    { x, y: y + 2 }
  ];
};

const isOppositeDirection = (current: Direction, next: Direction): boolean => {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
};

export const moveSnake = (snake: Snake, gameState: GameState, predictions?: number[]): Snake => {
  if (!snake.alive) return snake;

  const head = snake.positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;

  if (predictions) {
    // Usar predicciones de la red neuronal
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const maxIndex = predictions.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const predictedDirection = directions[maxIndex];
    
    // Solo permitir el cambio de dirección si no es opuesta
    if (!isOppositeDirection(snake.direction, predictedDirection)) {
      newDirection = predictedDirection;
    }
  } else {
    // Comportamiento aleatorio de respaldo con restricción de dirección opuesta
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    if (Math.random() < 0.2) {
      const validDirections = directions.filter(dir => !isOppositeDirection(snake.direction, dir));
      newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
    }
  }

  // Mover en la dirección elegida, manteniendo la dirección actual si la nueva es inválida
  switch (newDirection) {
    case 'UP':
      newHead.y = (newHead.y - 1 + GRID_SIZE) % GRID_SIZE;
      break;
    case 'DOWN':
      newHead.y = (newHead.y + 1) % GRID_SIZE;
      break;
    case 'LEFT':
      newHead.x = (newHead.x - 1 + GRID_SIZE) % GRID_SIZE;
      break;
    case 'RIGHT':
      newHead.x = (newHead.x + 1) % GRID_SIZE;
      break;
  }

  return {
    ...snake,
    positions: [newHead, ...snake.positions.slice(0, -1)],
    direction: newDirection
  };
};

// New function to save training data to Supabase
export const saveTrainingData = async (inputs: number[], outputs: number[], success: boolean) => {
  try {
    const { error } = await supabase.from('training_data').insert({
      inputs: inputs,
      outputs: outputs,
      success: success,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving training data:', error);
    }
  } catch (err) {
    console.error('Error in saveTrainingData:', err);
  }
};

// New function to fetch the best neural network model from Supabase
export const fetchBestModel = async (): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching best model:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in fetchBestModel:', err);
    return null;
  }
};

// New function to save a trained neural network model to Supabase
export const saveModel = async (model: number[], score: number) => {
  try {
    const { error } = await supabase.from('neural_networks').insert({
      weights: model,
      score: score,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving model:', error);
    }
  } catch (err) {
    console.error('Error in saveModel:', err);
  }
};

// Function to call the sync-models edge function
export const syncModels = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-models');
    
    if (error) {
      console.error('Error syncing models:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error calling sync-models function:', err);
    return null;
  }
};
