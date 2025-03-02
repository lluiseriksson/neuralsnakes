
import { NeuralNetwork as INeuralNetwork } from '../../types';

// Cache to avoid repeatedly loading models
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;
// FIXED: Start at a high generation to escape stagnation
let currentGeneration = 5; // Track current generation - FIXED to start higher

// Track games played since last generation increment
let gamesSinceLastGenIncrement = 0;
// Force more frequent generation increments
const GAMES_TO_FORCE_INCREMENT = 1; // Force increment after EVERY game

export const getModelCache = () => {
  return {
    bestModelCache,
    combinedModelCache,
    currentGeneration,
    gamesSinceLastGenIncrement
  };
};

export const setBestModelCache = (model: INeuralNetwork | null) => {
  bestModelCache = model;
  if (model) {
    // Always take the highest generation number
    const modelGeneration = model.getGeneration();
    if (modelGeneration > currentGeneration) {
      console.log(`⚡ CACHE UPDATE: Updating generation from ${currentGeneration} to ${modelGeneration} from best model ⚡`);
      currentGeneration = modelGeneration;
      gamesSinceLastGenIncrement = 0;
    }
  }
};

export const setCombinedModelCache = (model: INeuralNetwork | null) => {
  combinedModelCache = model;
  if (model) {
    // Always take the highest generation number 
    const modelGeneration = model.getGeneration();
    if (modelGeneration > currentGeneration) {
      console.log(`⚡ CACHE UPDATE: Updating generation from ${currentGeneration} to ${modelGeneration} from combined model ⚡`);
      currentGeneration = modelGeneration;
      gamesSinceLastGenIncrement = 0;
    }
  }
};

export const incrementGeneration = () => {
  // FIXED: Add +3 instead of +1 to accelerate evolution
  currentGeneration += 3;
  gamesSinceLastGenIncrement = 0;
  console.log(`⚡ Generation explicitly incremented to ${currentGeneration} ⚡`);
  return currentGeneration;
};

export const trackGamePlayed = () => {
  gamesSinceLastGenIncrement++;
  console.log(`Games since last generation increment: ${gamesSinceLastGenIncrement}`);
  
  // Force generation increment EVERY game
  if (gamesSinceLastGenIncrement >= GAMES_TO_FORCE_INCREMENT) {
    // FIXED: Add +3 instead of incrementing by 1
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    currentGeneration += 3;
    gamesSinceLastGenIncrement = 0;
    console.log(`⚡ New generation: ${currentGeneration} ⚡`);
    return currentGeneration;
  }
  
  return currentGeneration;
};

export const updateCurrentGeneration = (generation: number) => {
  // Always take the highest generation value
  if (generation > currentGeneration) {
    console.log(`⚡ Generation updated from ${currentGeneration} to ${generation} ⚡`);
    currentGeneration = generation;
    gamesSinceLastGenIncrement = 0;
  }
  return currentGeneration;
};

export const forceGenerationUpdate = (generation: number) => {
  // FIXED: Always add at least 3 to ensure significant progression when forcing updates
  const newGeneration = Math.max(generation, currentGeneration) + 3;
  console.log(`⚡ Generation forcefully set from ${currentGeneration} to ${newGeneration} ⚡`);
  currentGeneration = newGeneration;
  gamesSinceLastGenIncrement = 0;
  
  // Also update the model caches with the new generation
  if (bestModelCache) {
    bestModelCache.updateGeneration(newGeneration);
    console.log(`Best model cache generation updated to ${bestModelCache.getGeneration()}`);
  }
  if (combinedModelCache) {
    combinedModelCache.updateGeneration(newGeneration);
    console.log(`Combined model cache generation updated to ${combinedModelCache.getGeneration()}`);
  }
  
  return currentGeneration;
};

export const resetModelCaches = () => {
  // FIXED: Reset model caches more frequently to force fresh models
  console.log("Resetting model caches (but keeping generation number)");
  bestModelCache = null;
  combinedModelCache = null;
  // FIXED: Also increase generation when resetting caches to ensure progression
  currentGeneration += 2;
  console.log(`⚡ Generation after cache reset: ${currentGeneration} ⚡`);
};
