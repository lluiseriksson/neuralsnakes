
import { getCurrentGeneration, incrementGeneration, purgeAllModelCaches } from './generationTracking';

// Track games played since last generation increment
let gamesSinceLastIncrement = 0;
// Reduce number of games required to force increment for more frequent generation updates
const GAMES_TO_FORCE_INCREMENT = 2; // Changed from 3 to 2 for faster progression

// Track games since last complete reset
let gamesSinceLastReset = 0;
const GAMES_TO_FORCE_RESET = 10; // Keep at 10 for stability

// Track the highest score achieved
let highestScoreAchieved = 0;

export const getGamesSinceLastIncrement = (): number => {
  return gamesSinceLastIncrement;
};

export const resetGamesSinceLastIncrement = (): void => {
  gamesSinceLastIncrement = 0;
};

export const updateHighestScore = (score: number): void => {
  if (score > highestScoreAchieved) {
    highestScoreAchieved = score;
    console.log(`🏆 New highest score achieved: ${highestScoreAchieved}`);
  }
};

export const getHighestScore = (): number => {
  return highestScoreAchieved;
};

export const trackGamePlayed = (): number => {
  gamesSinceLastIncrement++;
  gamesSinceLastReset++;
  
  console.log(`Games since last generation increment: ${gamesSinceLastIncrement}`);
  console.log(`Games since last complete reset: ${gamesSinceLastReset}`);
  
  // Check if we should do a complete neural network reset
  if (gamesSinceLastReset >= GAMES_TO_FORCE_RESET) {
    console.log(`🔄 Forcing complete neural network reset after ${GAMES_TO_FORCE_RESET} games 🔄`);
    purgeAllModelCaches();
    gamesSinceLastReset = 0;
    // After reset, immediately return the new generation
    return getCurrentGeneration();
  }
  
  // Force generation increment after a set number of games for more predictable progression
  if (gamesSinceLastIncrement >= GAMES_TO_FORCE_INCREMENT) {
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    resetGamesSinceLastIncrement();
    return incrementGeneration();
  }
  
  return getCurrentGeneration();
};
