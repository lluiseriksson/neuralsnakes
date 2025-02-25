
import { Snake, Position, Direction, GameState } from "./types";
import { GRID_SIZE } from "./constants";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  // Generar snake más corta para mayor movilidad
  return Array(2).fill(null).map((_, i) => ({
    x,
    y: y + i,
  }));
};

export const getSnakeInputs = (snake: Snake, gameState: GameState): number[] => {
  const head = snake.positions[0];
  
  // Simplificar inputs para decisiones más claras
  const nearestApple = findNearestApple(head, gameState.apples);
  
  // Normalizar distancias
  const dx = nearestApple ? (nearestApple.position.x - head.x) / GRID_SIZE : 0;
  const dy = nearestApple ? (nearestApple.position.y - head.y) / GRID_SIZE : 0;

  // Inputs simplificados
  return [
    dx,                                    // Distancia X a la manzana
    dy,                                    // Distancia Y a la manzana
    snake.direction === 'UP' ? 1 : 0,      // Dirección actual
    snake.direction === 'DOWN' ? 1 : 0,
    snake.direction === 'LEFT' ? 1 : 0,
    snake.direction === 'RIGHT' ? 1 : 0,
    head.x / GRID_SIZE,                    // Posición actual
    head.y / GRID_SIZE
  ];
};

const findNearestApple = (head: Position, apples: Array<{position: Position}>) => {
  return apples.reduce((nearest, apple) => {
    const distance = Math.abs(apple.position.x - head.x) + Math.abs(apple.position.y - head.y);
    if (!nearest || distance < Math.abs(nearest.position.x - head.x) + Math.abs(nearest.position.y - head.y)) {
      return apple;
    }
    return nearest;
  });
};

export const getDirectionFromOutputs = (outputs: number[]): Direction => {
  const maxIndex = outputs.indexOf(Math.max(...outputs));
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  return directions[maxIndex];
};

export const moveSnake = (snake: Snake, gameState: GameState): Snake => {
  if (!snake.alive) return snake;

  const inputs = getSnakeInputs(snake, gameState);
  const outputs = snake.brain.predict(inputs);
  const newDirection = getDirectionFromOutputs(outputs);

  const head = snake.positions[0];
  let newHead = { ...head };

  // Movimiento determinista basado en la dirección
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

  // Mover la serpiente
  return {
    ...snake,
    positions: [newHead, ...snake.positions.slice(0, -1)],
    direction: newDirection
  };
};
