import { Snake } from '../../types';
import { getCurrentGeneration, getHighestScore } from '../snakeCreation/modelCache';

export const getGenerationInfo = (snakes: Snake[]) => {
  // Get current global generation
  const globalGeneration = getCurrentGeneration();
  console.log(`GLOBAL GENERATION in getGenerationInfo: ${globalGeneration}`);
  
  // Get global highest score
  const globalHighestScore = getHighestScore();
  
  // FIXED: Ensure all snakes use the global generation directly
  // This ensures consistent display across all components
  const generations = snakes.map(s => {
    // IMPORTANT: Force update all snakes to use the global generation
    // This is the critical fix that ensures all snakes show the same generation
    if (s.brain?.updateGeneration) {
      s.brain.updateGeneration(globalGeneration);
    }
    
    // IMPORTANT: Also update the snake's own generation property for consistency
    s.generation = globalGeneration;
    
    return globalGeneration;
  });
  
  // Get scores with fallback
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
  
  // Calculate progress percentage
  const progresses = snakes.map(s => {
    const progress = s.brain?.getProgressPercentage?.();
    return typeof progress === 'number' ? progress / 100 : (s.score / 50);
  });
  
  // FIXED: Use global generation directly instead of calculating max
  // Use globalHighestScore as a backup minimum
  const highestScore = Math.max(...scores, globalHighestScore);
  const highestProgress = Math.max(...progresses);
  
  // IMPORTANT: Create a correct map of snake ID to generation for consistent display
  const snakeGenerations = {};
  snakes.forEach(snake => {
    // FIXED: Always use the global generation for all snakes
    snakeGenerations[snake.id] = globalGeneration;
      
    // IMPORTANT: Also update the snake's own generation property for display consistency
    snake.generation = globalGeneration;
  });
  
  // Debug output to help with troubleshooting
  console.log("Generation info calculated:", {
    globalGeneration,
    globalHighestScore,
    snakeGenerations,
    highestScore,
    highestProgress
  });
  
  return {
    generation: globalGeneration,
    bestScore: highestScore,
    progress: highestProgress,
    snakeGenerations
  };
};
