
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

export const moveSnake = (snake: Snake, gameState: GameState): Snake => {
  if (!snake.alive) return snake;

  const head = snake.positions[0];
  let newHead = { ...head };

  // Lista de posibles direcciones
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  // Elegir una nueva dirección aleatoria o mantener la actual
  let newDirection = snake.direction;
  if (Math.random() < 0.2) { // 20% de probabilidad de cambiar de dirección
    const validDirections = directions.filter(dir => !isOppositeDirection(snake.direction, dir));
    newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
  }

  // Mover en la dirección elegida
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
