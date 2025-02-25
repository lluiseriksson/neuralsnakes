
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
  return [
    head.x, head.y,
    GRID_SIZE - head.x, GRID_SIZE - head.y,
    Math.min(...gameState.apples.map(apple => 
      Math.sqrt(Math.pow(apple.position.x - head.x, 2) + Math.pow(apple.position.y - head.y, 2))
    )),
    Math.min(...gameState.snakes
      .filter(s => s.id !== snake.id)
      .map(s => Math.min(...s.positions.map(pos =>
        Math.sqrt(Math.pow(pos.x - head.x, 2) + Math.pow(pos.y - head.y, 2))
      )))
    ),
    snake.direction === 'UP' || snake.direction === 'DOWN' ? 1 : 0,
    snake.direction === 'LEFT' || snake.direction === 'RIGHT' ? 1 : 0,
  ];
};

export const getDirectionFromOutputs = (outputs: number[]): Direction => {
  const index = outputs.indexOf(Math.max(...outputs));
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'][index] as Direction;
};

export const moveSnake = (snake: Snake, gameState: GameState): Snake => {
  const inputs = getSnakeInputs(snake, gameState);
  const outputs = snake.brain.predict(inputs);
  const newDirection = getDirectionFromOutputs(outputs);

  const head = snake.positions[0];
  let newHead = { ...head };

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
