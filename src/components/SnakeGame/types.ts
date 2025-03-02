
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
  // Performance stats for analysis
  getPerformanceStats: () => { learningAttempts: number, successfulMoves: number, failedMoves: number };
}

// Learning event for visualization and analysis
export interface LearningEvent {
  type: string;
  reward?: number;
  time: number;
  position: Position;
  distanceDelta?: number;
  missedAppleCount?: number;
  penalty?: number;
  missedPositions?: Position[];
}

// Decision information for tracking decision making process
export interface DecisionInfo {
  direction: Direction;
  reason: string;
  confidence?: number;
  time: number;
}

// Detailed decision tracking information
export interface DecisionRecord {
  inputs: number[];
  outputs: number[];
  headPosition: Position;
  time: number;
}

// Action recording for visualization
export interface ActionRecord {
  type: string;
  position: Position;
  time: number;
}

// Distance evaluation information
export interface DistanceEvaluation {
  prevDistance: number;
  currentDistance: number;
  improvement: number;
  time: number;
}

// Apple proximity information
export interface CollisionProximityInfo {
  hasNearbyApples: boolean;
  nearbyApples: any[];
  closestAppleDistance: number | null;
}

// Debug information for visualization
export interface DebugInfo {
  lastInputs?: number[];
  lastOutputs?: number[];
  validationError?: boolean;
  decisions?: DecisionRecord[];
  actions?: ActionRecord[];
  evaluations?: DistanceEvaluation[];
  collisionInfo?: CollisionProximityInfo;
  // Learning events array for tracking
  learningEvents?: LearningEvent[];
  // Last decision info for displaying the decision rationale
  lastDecision?: DecisionInfo;
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
  lastOutputs?: number[]; // Last decision outputs for learning
  lastInputs?: number[];  // Last decision inputs for learning
  movesWithoutEating?: number; // Counter for moves without eating
  decisionMetrics?: {
    applesEaten: number;
    applesIgnored: number;
    badDirections: number;
    goodDirections: number;
    killCount?: number;     // New: Track kills by this snake
    suicides?: number;      // New: Track suicides
    effectiveDecisions?: number; // New: Decisions that improved situation
    ineffectiveDecisions?: number; // New: Decisions that worsened situation
    survivalTime?: number;  // New: How long the snake survived
  }; // Metrics for analysis
  debugInfo?: DebugInfo; // Property for visualization and debugging
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
