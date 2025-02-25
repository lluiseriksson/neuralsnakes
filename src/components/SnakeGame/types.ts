
export type Position = {
  x: number;
  y: number;
};

export type Snake = {
  id: number;
  positions: Position[];
  direction: Direction;
  color: string;
  score: number;
  brain: NeuralNetwork;
  alive: boolean;
};

export type Apple = {
  position: Position;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = {
  snakes: Snake[];
  apples: Apple[];
  gridSize: number;
};

export type NeuralNetwork = {
  predict: (inputs: number[]) => number[];
};
