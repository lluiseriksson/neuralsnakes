
import { getCurrentGeneration, incrementGeneration, purgeAllModelCaches } from './generationTracking';

// Track games played since last generation increment
let gamesSinceLastIncrement = 0;
// Force very frequent generation increments
const GAMES_TO_FORCE_INCREMENT = 1; // Force increment after EVERY game

// Track games since last complete reset
let gamesSinceLastReset = 0;
const GAMES_TO_FORCE_RESET = 5; // Reduced from 10 to 5 for more frequent resets

export const getGamesSinceLastIncrement = (): number => {
  return gamesSinceLastIncrement;
};

export const resetGamesSinceLastIncrement = (): void => {
  gamesSinceLastIncrement = 0;
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
  
  // Force generation increment EVERY game with larger increments
  if (gamesSinceLastIncrement >= GAMES_TO_FORCE_INCREMENT) {
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    const newGeneration = getCurrentGeneration() + 20; // Increased from 10 to 20
    resetGamesSinceLastIncrement();
    console.log(`⚡ New generation: ${newGeneration} ⚡`);
    return incrementGeneration();
  }
  
  return getCurrentGeneration();
};
