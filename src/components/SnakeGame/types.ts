
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
  // Core properties required by the interface
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weights: number[][][];
  bias: number[][];
  
  // Methods used by the implementation
  predict: (inputs: number[]) => number[];
  learn: (success: boolean, inputs?: number[], outputs?: number[], reward?: number) => void;
  clone: (mutationRate?: number) => NeuralNetwork;
  mutate: (mutationRate?: number) => void;
  
  // Getters and setters
  getWeights: () => number[];
  setWeights: (weights: number[]) => void;
  getId: () => string | null;
  getGeneration: () => number;
  updateGeneration: (generation: number) => void;
  getBestScore: () => number;
  updateBestScore: (score: number) => void;
  getGamesPlayed: () => number;
  getProgressPercentage: () => number;
  getPerformanceStats: () => { learningAttempts: number, successfulMoves: number, failedMoves: number };
  setScore: (score: number) => void;
  
  // Storage methods
  save: (score: number) => Promise<string | null>;
  saveTrainingData: (inputs: number[], outputs: number[], success: boolean) => Promise<void>;
}

export interface SnakeDebugInfo {
  lastDecision?: {
    direction: Direction;
    reason: string;
    confidence?: number;
    headPosition: Position;
    time?: number;
  };
  collisionInfo?: {
    closestAppleDistance: number | null;
    nearbyApples: Apple[];
  };
  decisions?: {
    direction: Direction;
    headPosition: Position;
    inputs?: number[];
    outputs?: number[];
    time?: number;
  }[];
  learningEvents?: {
    reward: number;
    type?: string;
  }[];
  lastInputs?: number[];
  lastOutputs?: number[];
  validationError?: boolean;
  actions?: any[];
  evaluations?: any[];
}

export interface SnakeDecisionMetrics {
  applesEaten: number;
  applesIgnored: number;
  badDirections: number;
  goodDirections: number;
  killCount?: number;
  suicides?: number;
  effectiveDecisions?: number;
  ineffectiveDecisions?: number;
  survivalTime?: number;
}

export interface Snake {
  id: number;
  positions: Position[];
  color: string;
  direction: Direction;
  alive: boolean;
  score: number;
  brain: NeuralNetwork;
  generation: number; // Added required field
  lasers?: Position[];
  lastInputs?: number[];
  lastOutputs?: number[];
  age: number; // Added required field
  debugInfo?: SnakeDebugInfo;
  gridSize?: number;
  movesWithoutEating?: number;
  decisionMetrics?: SnakeDecisionMetrics;
  animation?: {
    isEating?: boolean;
    eatStartTime?: number;
    confidence?: number;
    decisionTime?: number;
    isDangerous?: boolean;
    dangerTime?: number;
  };
}

// Update this interface for database operations
export interface NeuralNetworkModel {
  id: string;
  weights: number[];
  score: number;
  generation: number;
  created_at: string;
  updated_at?: string;
  best_score: number;
  games_played: number;
  metadata?: any; // Add metadata field
}
