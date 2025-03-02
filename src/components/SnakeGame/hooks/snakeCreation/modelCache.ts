
import { NeuralNetwork as INeuralNetwork } from '../../types';

// Cache to avoid repeatedly loading models
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;
let currentGeneration = 1; // Track current generation

// Track games played since last generation increment
let gamesSinceLastGenIncrement = 0;
// Reduce this to force more frequent generation increments
const GAMES_TO_FORCE_INCREMENT = 3; // Force increment after just 3 games

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
      console.log(`Updating generation from ${currentGeneration} to ${modelGeneration} from best model`);
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
      console.log(`Updating generation from ${currentGeneration} to ${modelGeneration} from combined model`);
      currentGeneration = modelGeneration;
      gamesSinceLastGenIncrement = 0;
    }
  }
};

export const incrementGeneration = () => {
  currentGeneration += 1;
  gamesSinceLastGenIncrement = 0;
  console.log(`⚡ Generation explicitly incremented to ${currentGeneration} ⚡`);
  return currentGeneration;
};

export const trackGamePlayed = () => {
  gamesSinceLastGenIncrement++;
  console.log(`Games since last generation increment: ${gamesSinceLastGenIncrement}`);
  
  // Force generation increment after a certain number of games - REDUCED THRESHOLD
  if (gamesSinceLastGenIncrement >= GAMES_TO_FORCE_INCREMENT) {
    console.log(`⚡ Forcing generation increment after ${GAMES_TO_FORCE_INCREMENT} games ⚡`);
    return incrementGeneration();
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
  // Force a specific generation value (use carefully)
  console.log(`⚡ Generation forcefully set from ${currentGeneration} to ${generation} ⚡`);
  currentGeneration = generation;
  gamesSinceLastGenIncrement = 0;
  return currentGeneration;
};

export const resetModelCaches = () => {
  // Use this to clear caches between major game resets if needed
  console.log("Resetting model caches (but keeping generation number)");
  bestModelCache = null;
  combinedModelCache = null;
  // Do NOT reset currentGeneration here as we want to maintain progression
};
