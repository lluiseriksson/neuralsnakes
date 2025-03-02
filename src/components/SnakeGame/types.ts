
export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface NeuralNetwork {
  predict: (inputs: number[]) => number[];
  learn: (success: boolean, inputs?: number[], outputs?: number[], reward?: number) => void;
  clone: (mutationRate?: number) => NeuralNetwork;
  save: (score: number) => Promise<string | null>;
  getId: () => string | null;
  getWeights: () => number[];
  setWeights: (weights: number[]) => void;
  getGeneration: () => number;
  updateGeneration: (generation: number) => void;
  getBestScore: () => number;
  getGamesPlayed: () => number;
  updateBestScore: (score: number) => void;
  mutate: (mutationRate?: number) => void;
  getProgressPercentage: () => number;
  saveTrainingData: (inputs: number[], outputs: number[], success: boolean) => Promise<void>;
  // Añadimos la propiedad getPerformanceStats para análisis
  getPerformanceStats: () => { learningAttempts: number, successfulMoves: number, failedMoves: number };
}

export type Snake = {
  id: number;
  positions: Position[];
  direction: Direction;
  color: string;
  score: number;
  brain: NeuralNetwork;
  alive: boolean;
  gridSize: number;
  lastOutputs?: number[]; // Outputs de la última decisión para aprendizaje
  lastInputs?: number[];  // Inputs de la última decisión para aprendizaje
  movesWithoutEating?: number; // Contador de movimientos sin comer
  decisionMetrics?: {
    applesEaten: number;
    applesIgnored: number;
    badDirections: number;
    goodDirections: number;
  }; // Métricas para análisis
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
  metadata?: unknown;
};
