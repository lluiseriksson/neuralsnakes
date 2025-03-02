
import { Snake } from '../../types';

export const getGenerationInfo = (snakes: Snake[]) => {
  // Get generation information with safe handling of null/undefined brains
  const generations = snakes.map(s => s.brain?.getGeneration?.() || 1);
  const scores = snakes.map(s => s.brain?.getBestScore?.() || 0);
  const progresses = snakes.map(s => s.brain?.getProgressPercentage?.() || 0);
  
  const highestGeneration = Math.max(...generations);
  const highestScore = Math.max(...scores);
  const highestProgress = Math.max(...progresses);
  
  return {
    generation: highestGeneration,
    bestScore: highestScore,
    progress: highestProgress
  };
};
