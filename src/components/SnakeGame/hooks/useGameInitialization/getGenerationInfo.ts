
import { Snake } from '../../types';
import { getCurrentGeneration } from '../snakeCreation/modelCache';

export const getGenerationInfo = (snakes: Snake[]) => {
  // Get current global generation
  const globalGeneration = getCurrentGeneration();
  
  // Get generation information with safe handling of null/undefined brains
  const generations = snakes.map(s => s.brain?.getGeneration?.() || globalGeneration);
  const scores = snakes.map(s => s.brain?.getBestScore?.() || 0);
  const progresses = snakes.map(s => s.brain?.getProgressPercentage?.() || 0);
  
  const highestGeneration = Math.max(...generations, globalGeneration);
  const highestScore = Math.max(...scores);
  const highestProgress = Math.max(...progresses);
  
  // Create a map of snake ID to generation
  const snakeGenerations = {};
  snakes.forEach(snake => {
    snakeGenerations[snake.id] = snake.brain?.getGeneration?.() || globalGeneration;
  });
  
  return {
    generation: highestGeneration,
    bestScore: highestScore,
    progress: highestProgress,
    snakeGenerations
  };
};
