
import { getCurrentGeneration, incrementGeneration, purgeAllModelCaches } from './generationTracking';
import { updateHighestScoreAchieved, getCurrentHighestScore } from './scoreTracking';

// Track games played since last generation increment
let gamesSinceLastIncrement = 0;
// Always increment generation after each game
const GAMES_TO_FORCE_INCREMENT = 1; 

// Track games since last complete reset
let gamesSinceLastReset = 0;
const GAMES_TO_FORCE_RESET = 20; // Increased for better stability

export const getGamesSinceLastIncrement = (): number => {
  return gamesSinceLastIncrement;
};

export const resetGamesSinceLastIncrement = (): void => {
  gamesSinceLastIncrement = 0;
};

export const updateHighestScore = (score: number): void => {
  updateHighestScoreAchieved(score);
};

export const getHighestScore = (): number => {
  // Return the current highest score
  return getCurrentHighestScore();
};

export const trackGamePlayed = (): number => {
  gamesSinceLastIncrement++;
  gamesSinceLastReset++;
  
  console.log(`Games since last generation increment: ${gamesSinceLastIncrement}`);
  console.log(`Games since last complete reset: ${gamesSinceLastReset}`);
  
  // Check if we should do a complete neural network reset
  if (gamesSinceLastReset >= GAMES_TO_FORCE_RESET) {
    console.log(`🔄 Forcing complete neural network reset after ${GAMES_TO_FORCE_RESET} games 🔄`);
    
    // Use the purgeAllModelCaches function but handle it safely
    try {
      purgeAllModelCaches();
      gamesSinceLastReset = 0;
      // After reset, immediately return the new generation
      return getCurrentGeneration();
    } catch (error) {
      console.error("Error during model cache purge:", error);
      // If reset fails, still increment generation to ensure progress
      return incrementGeneration();
    }
  }
  
  // ALWAYS Force generation increment after every game
  console.log(`⚡ Incrementing generation after game ⚡`);
  resetGamesSinceLastIncrement();
  return incrementGeneration();
};
