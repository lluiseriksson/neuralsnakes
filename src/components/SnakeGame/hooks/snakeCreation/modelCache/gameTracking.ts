
import { getCurrentGeneration, incrementGeneration, purgeAllModelCaches } from './generationTracking';

// Track games played since last generation increment
let gamesSinceLastIncrement = 0;
// Force less frequent generation increments for more stability
const GAMES_TO_FORCE_INCREMENT = 3; // Force increment after 3 games

// Track games since last complete reset
let gamesSinceLastReset = 0;
const GAMES_TO_FORCE_RESET = 10; // Changed back to 10 for more stability

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
  
  // Force generation increment less frequently for more stability
  if (gamesSinceLastIncrement >= GAMES_TO_FORCE_INCREMENT) {
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    resetGamesSinceLastIncrement();
    return incrementGeneration();
  }
  
  return getCurrentGeneration();
};
