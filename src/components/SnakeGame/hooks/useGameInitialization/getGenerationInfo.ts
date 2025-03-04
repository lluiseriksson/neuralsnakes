
import { Snake } from '../../types';
import { getCurrentGeneration, getHighestScore } from '../snakeCreation/modelCache';

export const getGenerationInfo = (snakes: Snake[]) => {
  // Get current global generation
  const globalGeneration = getCurrentGeneration();
  
  // Get global highest score
  const globalHighestScore = getHighestScore();
  
  // Fix: Ensure all snakes report the correct generation
  const generations = snakes.map(s => {
    // Ensure we're getting proper generation from the brain
    let brainGen = s.brain?.getGeneration?.();
    
    // If we can't get a proper generation, use the global generation
    if (typeof brainGen !== 'number' || brainGen < 1) {
      brainGen = globalGeneration;
      // Try to update the snake's brain with the global generation if possible
      if (s.brain?.updateGeneration) {
        s.brain.updateGeneration(globalGeneration);
      }
    }
    
    return brainGen;
  });
  
  // Fix: Properly capture scores with fallback
  const scores = snakes.map(s => {
    // Try to get the best score from the brain first
    const bestScore = s.brain?.getBestScore?.();
    // If brain's best score is available and valid, use it
    if (typeof bestScore === 'number' && bestScore > 0) {
      return bestScore;
    }
    // Otherwise fallback to current snake score
    return s.score || 0;
  });
  
  // Fix: Properly calculate progress percentage
  const progresses = snakes.map(s => {
    const progress = s.brain?.getProgressPercentage?.();
    return typeof progress === 'number' ? progress / 100 : (s.score / 50);
  });
  
  // Calculate highest values correctly with fallback to global
  const highestGeneration = Math.max(...generations, globalGeneration);
  // Use globalHighestScore as a backup minimum
  const highestScore = Math.max(...scores, globalHighestScore);
  const highestProgress = Math.max(...progresses);
  
  // Create a correct map of snake ID to generation
  const snakeGenerations = {};
  snakes.forEach(snake => {
    const brainGen = snake.brain?.getGeneration?.();
    // If snake has a valid generation, use it, otherwise use global generation
    snakeGenerations[snake.id] = (typeof brainGen === 'number' && brainGen > 0) ? 
      brainGen : globalGeneration;
  });
  
  // Debug output to help with troubleshooting
  console.log("Generation info calculated:", {
    globalGeneration,
    globalHighestScore,
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
