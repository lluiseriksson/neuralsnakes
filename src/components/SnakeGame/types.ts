
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

// Define un tipo para eventos de aprendizaje
type LearningEvent = {
  type: string;
  reward?: number;
  time: number;
  position: Position;
  distanceDelta?: number;
  missedAppleCount?: number;
  penalty?: number;
  missedPositions?: Position[];
};

// New decision type to track decision making
type DecisionInfo = {
  direction: Direction;
  reason: string;
  confidence?: number;
  time: number;
};

// Información de depuración para visualización
export type DebugInfo = {
  lastInputs?: number[];
  lastOutputs?: number[];
  validationError?: boolean;
  decisions?: {
    inputs: number[];
    outputs: number[];
    headPosition: Position;
    time: number;
  }[];
  actions?: {
    type: string;
    position: Position;
    time: number;
  }[];
  evaluations?: {
    prevDistance: number;
    currentDistance: number;
    improvement: number;
    time: number;
  }[];
  collisionInfo?: {
    hasNearbyApples: boolean;
    nearbyApples: any[];
    closestAppleDistance: number | null;
  };
  // Learning events array for tracking
  learningEvents?: LearningEvent[];
  // Last decision info for displaying the decision rationale
  lastDecision?: DecisionInfo;
};

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
  debugInfo?: DebugInfo; // Nueva propiedad para visualización y depuración
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
