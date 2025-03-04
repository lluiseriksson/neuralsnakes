export type Position = {
  x: number;
  y: number;
};

export type Apple = {
  id: number;
  position: Position;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  snakes: Snake[];
  apples: Apple[];
  gridSize: number;
}

export interface NeuralNetwork {
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weights: number[][][];
  bias: number[][];
}

export interface SnakeDebugInfo {
  lastDecision?: {
    direction: Direction;
    reason: string;
    confidence?: number;
    headPosition: Position;
  };
  collisionInfo?: {
    closestAppleDistance: number | null;
    nearbyApples: Apple[];
  };
  decisions?: {
    direction: Direction;
    headPosition: Position;
  }[];
  learningEvents?: {
    reward: number;
  }[];
  lastInputs?: number[];
}

export interface Snake {
  id: number;
  positions: Position[];
  color: string;
  direction: Direction;
  alive: boolean;
  score: number;
  brain: NeuralNetwork;
  generation: number;
  lasers?: Position[];
  lastInputs?: number[];
  age: number;
  debugInfo?: SnakeDebugInfo;
}
