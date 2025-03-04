
import { Snake } from '../../types';
import { getCurrentGeneration } from '../snakeCreation/modelCache';

export const getGenerationInfo = (snakes: Snake[]) => {
  // Get current global generation
  const globalGeneration = getCurrentGeneration();
  
  // Fix: Properly capture snake generations with fallback
  const generations = snakes.map(s => {
    // Ensure we're getting proper generation from the brain
    const brainGen = s.brain?.getGeneration?.();
    // Return the actual brain generation or use global as fallback
    return typeof brainGen === 'number' ? brainGen : globalGeneration;
  });
  
  // Fix: Properly capture scores with fallback
  const scores = snakes.map(s => {
    const bestScore = s.brain?.getBestScore?.();
    return typeof bestScore === 'number' ? bestScore : s.score || 0;
  });
  
  // Fix: Properly calculate progress percentage
  const progresses = snakes.map(s => {
    const progress = s.brain?.getProgressPercentage?.();
    return typeof progress === 'number' ? progress : (s.score / 50) * 100;
  });
  
  // Calculate highest values correctly with fallback to global
  const highestGeneration = Math.max(...generations, globalGeneration);
  const highestScore = Math.max(...scores);
  const highestProgress = Math.max(...progresses);
  
  // Create a correct map of snake ID to generation
  const snakeGenerations = {};
  snakes.forEach(snake => {
    const brainGen = snake.brain?.getGeneration?.();
    snakeGenerations[snake.id] = typeof brainGen === 'number' ? brainGen : globalGeneration;
  });
  
  // Debug output to help with troubleshooting
  console.log("Generation info calculated:", {
    globalGeneration,
    snakeGenerations,
    highestGeneration, 
    highestScore,
    highestProgress
  });
  
  return {
    generation: highestGeneration,
    bestScore: highestScore,
    progress: highestProgress,
    snakeGenerations
  };
};
