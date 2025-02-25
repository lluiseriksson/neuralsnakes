
import { Snake, Position, Direction, GameState } from "./types";
import { GRID_SIZE } from "./constants";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  return Array(4).fill(null).map((_, i) => ({
    x,
    y: y + i,
  }));
};

export const getSnakeInputs = (snake: Snake, gameState: GameState): number[] => {
  const head = snake.positions[0];
  
  // Encontrar la manzana más cercana y su dirección relativa
  const nearestApple = gameState.apples.reduce((nearest, apple) => {
    const distance = Math.sqrt(
      Math.pow(apple.position.x - head.x, 2) + 
      Math.pow(apple.position.y - head.y, 2)
    );
    if (!nearest || distance < nearest.distance) {
      return { apple, distance };
    }
    return nearest;
  }, null as { apple: typeof gameState.apples[0], distance: number } | null);

  // Calcular direcciones relativas a la manzana
  const appleDirectionX = nearestApple ? Math.sign(nearestApple.apple.position.x - head.x) : 0;
  const appleDirectionY = nearestApple ? Math.sign(nearestApple.apple.position.y - head.y) : 0;

  return [
    head.x / GRID_SIZE, // Posición X normalizada
    head.y / GRID_SIZE, // Posición Y normalizada
    appleDirectionX, // Dirección X hacia la manzana (-1, 0, 1)
    appleDirectionY, // Dirección Y hacia la manzana (-1, 0, 1)
    snake.direction === 'UP' ? 1 : -1,
    snake.direction === 'DOWN' ? 1 : -1,
    snake.direction === 'LEFT' ? 1 : -1,
    snake.direction === 'RIGHT' ? 1 : -1,
  ];
};

export const getDirectionFromOutputs = (outputs: number[]): Direction => {
  const index = outputs.indexOf(Math.max(...outputs));
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'][index] as Direction;
};

export const moveSnake = (snake: Snake, gameState: GameState): Snake => {
  if (!snake.alive) return snake;

  // Obtener nueva dirección de la IA
  const inputs = getSnakeInputs(snake, gameState);
  const outputs = snake.brain.predict(inputs);
  const newDirection = getDirectionFromOutputs(outputs);

  const head = snake.positions[0];
  let newHead = { ...head };

  // Calcular nueva posición basada en la dirección
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
    direction: newDirection,
  };
};
