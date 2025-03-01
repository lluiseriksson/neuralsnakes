
import { Snake, Position, Direction, GameState } from "./types";
import { GRID_SIZE } from "./constants";

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
  if (!snake.alive) {
    console.log(`No moviendo serpiente ${snake.id}: está muerta`);
    return snake;
  }
  
  console.log(`Moviendo serpiente ${snake.id} en dirección ${snake.direction}`);

  // Hacer una copia profunda de las posiciones para evitar modificaciones accidentales
  const positions = [...snake.positions.map(pos => ({ ...pos }))];
  const head = positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || GRID_SIZE;

  if (predictions && predictions.length === 4) {
    // Use neural network predictions for movement
    // Add a small random factor to break ties and encourage exploration
    const randomFactor = 0.1;
    const adjustedPredictions = predictions.map(p => p + Math.random() * randomFactor);
    
    // Find the direction with the highest prediction value
    const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const maxIndex = adjustedPredictions.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const predictedDirection = directions[maxIndex];
    
    // Only allow direction change if not opposite to current direction
    if (!isOppositeDirection(snake.direction, predictedDirection)) {
      console.log(`Serpiente ${snake.id} cambia dirección de ${snake.direction} a ${predictedDirection}`);
      newDirection = predictedDirection;
    } else {
      console.log(`Serpiente ${snake.id} intentó ir en dirección opuesta ${predictedDirection}, manteniendo ${snake.direction}`);
    }
  } else {
    console.log(`Serpiente ${snake.id} sin predicciones o predicciones inválidas:`, predictions);
  }

  // Move in the chosen direction
  switch (newDirection) {
    case 'UP':
      newHead.y = (newHead.y - 1 + gridSize) % gridSize;
      break;
    case 'DOWN':
      newHead.y = (newHead.y + 1) % gridSize;
      break;
    case 'LEFT':
      newHead.x = (newHead.x - 1 + gridSize) % gridSize;
      break;
    case 'RIGHT':
      newHead.x = (newHead.x + 1) % gridSize;
      break;
  }
  
  console.log(`Serpiente ${snake.id} nueva posición cabeza: (${newHead.x}, ${newHead.y})`);

  // Create new positions array with the new head at index 0
  // Mover cada segmento a la posición del segmento anterior, y la cabeza a la nueva posición
  const newPositions = [newHead];
  for (let i = 0; i < positions.length - 1; i++) {
    newPositions.push({ ...positions[i] });
  }

  // Ensure there's always at least one segment (head)
  if (newPositions.length === 0) {
    console.log(`Serpiente ${snake.id} sin segmentos, añadiendo cabeza`);
    newPositions.push(newHead);
  }

  return {
    ...snake,
    positions: newPositions,
    direction: newDirection
  };
};
