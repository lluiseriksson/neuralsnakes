
import { Snake, Position, Direction, GameState } from "./types";
import { GRID_SIZE } from "./constants";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  return [
    { x, y },
    { x, y: y + 1 },
    { x, y: y + 2 }
  ];
};

export const moveSnake = (snake: Snake, gameState: GameState): Snake => {
  if (!snake.alive) return snake;

  const head = snake.positions[0];
  let newHead = { ...head };

  // Movimiento aleatorio pero con preferencia por la dirección actual
  let possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  // 80% de probabilidad de mantener la dirección actual si es posible
  if (Math.random() < 0.8) {
    possibleDirections = [snake.direction];
  }

  const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];

  // Mover en la dirección elegida
  switch (direction) {
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

  // Actualizar la serpiente
  return {
    ...snake,
    positions: [newHead, ...snake.positions.slice(0, -1)],
    direction: direction
  };
};
