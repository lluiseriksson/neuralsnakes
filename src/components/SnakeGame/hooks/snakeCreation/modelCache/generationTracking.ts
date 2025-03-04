
// We need to fix the circular dependencies
// Import from modelCache directory structure 
import { resetGamesSinceLastIncrement } from './gameTracking';
import { getModelCache } from './cacheManagement';

// Reset the generation counter to a reasonable starting value
// This forces re-learning with the new game rules
let currentGeneration = 1; 

export const getCurrentGeneration = (): number => {
  return currentGeneration;
};

export const incrementGeneration = (): number => {
  // More aggressive incrementation to push evolution faster
  currentGeneration += 5; // Reduced from 25 to 5 for more gradual progression
  resetGamesSinceLastIncrement();
  console.log(`⚡ Generation incrementally increased to ${currentGeneration} ⚡`);
  
  // Also update model caches with new generation
  updateModelCachesGeneration(currentGeneration);
  
  return currentGeneration;
};

export const updateCurrentGeneration = (generation: number): number => {
  // Always take the highest generation value
  if (generation > currentGeneration) {
    console.log(`⚡ Generation updated from ${currentGeneration} to ${generation} ⚡`);
    currentGeneration = generation;
    resetGamesSinceLastIncrement();
    
    // Also update model caches with the new generation
    updateModelCachesGeneration(currentGeneration);
  }
  return currentGeneration;
};

// Enhanced generation update based on performance metrics
export const advanceGenerationBasedOnMetrics = (
  score: number, 
  applesEaten: number, 
  kills: number, 
  deaths: number, 
  suicides: number
): number => {
  // Calculate a performance index based on all metrics
  const performanceIndex = calculatePerformanceIndex(score, applesEaten, kills, deaths, suicides);
  
  // Calculate significant generation boost based on performance
  // Significantly increased generation boost to overcome stagnation
  const generationBoost = Math.floor(performanceIndex * 3) + 2; // Reduced boost values for more gradual progression
  
  // Always increment by at least 2 to ensure steady progression
  const newGeneration = currentGeneration + Math.max(generationBoost, 2);
  
  console.log(`⚡ Advanced generation from ${currentGeneration} to ${newGeneration} based on metrics ⚡`);
  console.log(`Performance metrics: score=${score}, apples=${applesEaten}, kills=${kills}, deaths=${deaths}, suicides=${suicides}`);
  console.log(`Performance index: ${performanceIndex.toFixed(2)}, resulting in boost of ${generationBoost}`);
  
  currentGeneration = newGeneration;
  resetGamesSinceLastIncrement();
  
  // Also update model caches with the new generation
  updateModelCachesGeneration(newGeneration);
  
  return currentGeneration;
};

// Calculate performance index from multiple metrics
const calculatePerformanceIndex = (
  score: number, 
  applesEaten: number, 
  kills: number, 
  deaths: number, 
  suicides: number
): number => {
  // Weight factors for different metrics - adjusted for better performance
  const scoreWeight = 1.0;
  const appleWeight = 1.5; 
  const killWeight = 1.0;
  const deathPenalty = -0.2;
  const suicidePenalty = -0.3;
  
  // Calculate positive contribution
  const positiveFactors = (score * scoreWeight) + (applesEaten * appleWeight) + (kills * killWeight);
  
  // Calculate negative factors
  const negativeFactors = (deaths * deathPenalty) + (suicides * suicidePenalty);
  
  // Calculate overall index (ensure it's at least 0.1)
  return Math.max(0.1, positiveFactors + negativeFactors);
};

export const forceGenerationUpdate = (generation: number): number => {
  // Less aggressive boost when forcing updates
  const newGeneration = Math.max(generation, currentGeneration) + 5; // Reduced boost
  console.log(`⚡ Generation forcefully set from ${currentGeneration} to ${newGeneration} ⚡`);
  currentGeneration = newGeneration;
  resetGamesSinceLastIncrement();
  
  // Update the model caches with the new generation
  updateModelCachesGeneration(newGeneration);
  
  return currentGeneration;
};

// Update model cache generations
const updateModelCachesGeneration = (newGeneration: number): void => {
  const { bestModelCache, combinedModelCache } = getModelCache();
  
  if (bestModelCache) {
    bestModelCache.updateGeneration(newGeneration);
    console.log(`Best model cache generation updated to ${bestModelCache.getGeneration()}`);
  }
  if (combinedModelCache) {
    combinedModelCache.updateGeneration(newGeneration);
    console.log(`Combined model cache generation updated to ${combinedModelCache.getGeneration()}`);
  }
};

// Reset both model caches to force fresh learning
export const purgeAllModelCaches = (): void => {
  console.log("🔄 PURGING ALL MODEL CACHES - FORCING COMPLETE RESET 🔄");
  
  // Reset the generation to 1 to start fresh learning with new rules
  currentGeneration = 1;
  console.log(`⚡ Generation reset to ${currentGeneration} to apply new game rules ⚡`);
  
  // Break circular dependency using dynamic import
  const resetModelCaches = require('./cacheManagement').resetModelCaches;
  resetModelCaches();
};
