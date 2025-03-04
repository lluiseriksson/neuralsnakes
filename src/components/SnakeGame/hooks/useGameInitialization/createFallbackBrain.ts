
import { Direction, NeuralNetwork } from '../../types';

// Function to create a brain of respaldo for a snake
export const createFallbackBrain = (): NeuralNetwork => {
  // Create a properly typed fallback brain that satisfies the NeuralNetwork interface
  const fallbackBrain: NeuralNetwork = {
    predict: () => [Math.random(), Math.random(), Math.random(), Math.random()],
    learn: () => {},
    getGeneration: () => 1,
    getBestScore: () => 0,
    getProgressPercentage: () => 0,
    updateBestScore: () => {},
    updateGeneration: () => {},
    save: async () => "fallback-id",
    clone: () => {
      // Return a properly typed NeuralNetwork
      return fallbackBrain;
    },
    getId: () => null,
    getWeights: () => [],
    setWeights: () => {},
    mutate: () => {},
    getGamesPlayed: () => 0,
    saveTrainingData: async () => {},
    getPerformanceStats: () => ({ learningAttempts: 0, successfulMoves: 0, failedMoves: 0 }),
    // Add the missing setScore method
    setScore: () => {}
  };

  return fallbackBrain;
};
