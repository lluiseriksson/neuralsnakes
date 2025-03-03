
// We need to fix the circular dependencies
// Import from modelCache directory structure 
import { resetGamesSinceLastIncrement } from './gameTracking';
import { getModelCache } from './cacheManagement';

// Reset to generation 1 as requested
let currentGeneration = 1; 

export const getCurrentGeneration = (): number => {
  return currentGeneration;
};

export const incrementGeneration = (): number => {
  // More aggressive incrementation to push evolution faster
  currentGeneration += 10;
  resetGamesSinceLastIncrement();
  console.log(`⚡ Generation aggressively incremented to ${currentGeneration} ⚡`);
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
  const generationBoost = Math.floor(performanceIndex * 10) + 5;
  
  // Always increment by at least 5 to ensure progression
  const newGeneration = currentGeneration + Math.max(generationBoost, 5);
  
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
  // Weight factors for different metrics
  const scoreWeight = 1.0;
  const appleWeight = 1.5;
  const killWeight = 2.0;
  const deathPenalty = -0.5;
  const suicidePenalty = -1.0;
  
  // Calculate positive contribution
  const positiveFactors = (score * scoreWeight) + (applesEaten * appleWeight) + (kills * killWeight);
  
  // Calculate negative factors
  const negativeFactors = (deaths * deathPenalty) + (suicides * suicidePenalty);
  
  // Calculate overall index (ensure it's at least 0.1)
  return Math.max(0.1, positiveFactors + negativeFactors);
};

export const forceGenerationUpdate = (generation: number): number => {
  // Even more aggressive boost when forcing updates
  const newGeneration = Math.max(generation, currentGeneration) + 10;
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
  
  // Force a generation jump to prevent stagnation
  currentGeneration += 50;
  console.log(`⚡ Post-reset generation set to ${currentGeneration} ⚡`);
  
  // Break circular dependency using dynamic import
  const resetModelCaches = require('./cacheManagement').resetModelCaches;
  resetModelCaches();
};
