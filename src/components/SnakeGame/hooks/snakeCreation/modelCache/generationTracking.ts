
import { resetGamesSinceLastIncrement } from './gameTracking';

// FIXED: Start at a high generation to escape stagnation
let currentGeneration = 5; // Track current generation - FIXED to start higher

export const getCurrentGeneration = (): number => {
  return currentGeneration;
};

export const incrementGeneration = (): number => {
  // FIXED: Add +3 instead of +1 to accelerate evolution
  currentGeneration += 3;
  resetGamesSinceLastIncrement();
  console.log(`⚡ Generation explicitly incremented to ${currentGeneration} ⚡`);
  return currentGeneration;
};

export const updateCurrentGeneration = (generation: number): number => {
  // Always take the highest generation value
  if (generation > currentGeneration) {
    console.log(`⚡ Generation updated from ${currentGeneration} to ${generation} ⚡`);
    currentGeneration = generation;
    resetGamesSinceLastIncrement();
  }
  return currentGeneration;
};

export const forceGenerationUpdate = (generation: number): number => {
  // FIXED: Always add at least 3 to ensure significant progression when forcing updates
  const newGeneration = Math.max(generation, currentGeneration) + 3;
  console.log(`⚡ Generation forcefully set from ${currentGeneration} to ${newGeneration} ⚡`);
  currentGeneration = newGeneration;
  resetGamesSinceLastIncrement();
  
  // Also update the model caches with the new generation
  const { bestModelCache, combinedModelCache } = getModelCache();
  
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

// Import from other modules to avoid circular dependencies
import { getModelCache } from './cacheManagement';
