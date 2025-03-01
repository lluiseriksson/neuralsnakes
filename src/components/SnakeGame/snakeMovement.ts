
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
  if (!snake.alive) return snake;

  const head = snake.positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || GRID_SIZE;

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

  return {
    ...snake,
    positions: [newHead, ...snake.positions.slice(0, -1)],
    direction: newDirection
  };
};
