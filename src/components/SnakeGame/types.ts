
export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface NeuralNetwork {
  predict: (inputs: number[]) => number[];
  learn: (success: boolean, inputs?: number[], outputs?: number[], reward?: number) => void;
  clone: (mutationRate?: number) => NeuralNetwork;
  getGeneration: () => number;
  getBestScore: () => number;
  getProgressPercentage: () => number;
  save: (score: number) => Promise<string | null>;
  getId: () => string | null;
  getWeights: () => number[];
  setWeights: (weights: number[]) => void;
  getGamesPlayed: () => number;
  updateBestScore: (score: number) => void;
  mutate: (mutationRate?: number) => void;
}

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

export type GameState = {
  snakes: Snake[];
  apples: Apple[];
  gridSize: number;
};

export type NeuralNetworkModel = {
  id: string;
  weights: unknown;
  score: number;
  generation: number;
  metadata?: {
    best_score?: number;
    games_played?: number;
  };
};
