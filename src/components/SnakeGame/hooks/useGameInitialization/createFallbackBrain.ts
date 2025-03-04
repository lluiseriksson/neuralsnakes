
import { Direction, NeuralNetwork } from '../../types';

// Function to create a fallback brain for a snake
export const createFallbackBrain = (): NeuralNetwork => {
  // Create a properly typed fallback brain that satisfies the NeuralNetwork interface
  const fallbackBrain: NeuralNetwork = {
    // Required interface properties
    inputNodes: 8,
    hiddenNodes: 12,
    outputNodes: 4,
    weights: [[], []], // Empty arrays as placeholders
    bias: [[], []], // Empty arrays as placeholders
    
    // Method implementations
    predict: () => [Math.random(), Math.random(), Math.random(), Math.random()],
    learn: () => {},
    getGeneration: () => 1,
    getBestScore: () => 0,
    getProgressPercentage: () => 0,
    updateBestScore: () => {},
    updateGeneration: () => {},
    save: async () => "fallback-id",
    clone: () => fallbackBrain,
    getId: () => null,
    getWeights: () => [],
    setWeights: () => {},
    mutate: () => {},
    getGamesPlayed: () => 0,
    saveTrainingData: async () => {},
    getPerformanceStats: () => ({ learningAttempts: 0, successfulMoves: 0, failedMoves: 0 }),
    setScore: () => {}
  };

  return fallbackBrain;
};
