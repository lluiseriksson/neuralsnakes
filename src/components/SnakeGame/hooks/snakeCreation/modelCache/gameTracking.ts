
import { getCurrentGeneration, incrementGeneration } from './generationTracking';

// Track games played since last generation increment
let gamesSinceLastGenIncrement = 0;
// Force more frequent generation increments
const GAMES_TO_FORCE_INCREMENT = 1; // Force increment after EVERY game

export const getGamesSinceLastIncrement = (): number => {
  return gamesSinceLastGenIncrement;
};

export const resetGamesSinceLastIncrement = (): void => {
  gamesSinceLastGenIncrement = 0;
};

export const trackGamePlayed = (): number => {
  gamesSinceLastGenIncrement++;
  console.log(`Games since last generation increment: ${gamesSinceLastGenIncrement}`);
  
  // Force generation increment EVERY game
  if (gamesSinceLastGenIncrement >= GAMES_TO_FORCE_INCREMENT) {
    // FIXED: Add +3 instead of incrementing by 1
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    const newGeneration = getCurrentGeneration() + 3;
    resetGamesSinceLastIncrement();
    console.log(`⚡ New generation: ${newGeneration} ⚡`);
    return incrementGeneration();
  }
  
  return getCurrentGeneration();
};
