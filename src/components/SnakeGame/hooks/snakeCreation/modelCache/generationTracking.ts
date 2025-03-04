// We need to fix the circular dependencies
// Import from modelCache directory structure 
import { resetGamesSinceLastIncrement } from './gameTracking';
import { getModelCache } from './cacheManagement';

// Start generation at 1 for more intuitive progression
let currentGeneration = 1; 

export const getCurrentGeneration = (): number => {
  return currentGeneration;
};

export const incrementGeneration = (): number => {
  // More predictable incrementation - always increment by 1
  currentGeneration += 1;
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
  
  // More predictable generation boost - always increment by 1 for each apple eaten plus bonus
  const generationBoost = Math.min(3, 1 + applesEaten);
  
  // Update to new generation
  const newGeneration = currentGeneration + generationBoost;
  
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
  
  // Calculate overall index (ensure it's at least 0.5 to keep generations moving)
  return Math.max(0.5, positiveFactors + negativeFactors);
};

export const forceGenerationUpdate = (generation: number): number => {
  // More predictable boost when forcing updates - increment by 1
  const newGeneration = Math.max(generation, currentGeneration + 1);
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
  
  // Reset the generation to 1 for a fresh start
  currentGeneration = 1;
  console.log(`⚡ Generation reset to ${currentGeneration} to apply new game rules ⚡`);
  
  // Break circular dependency using dynamic import
  const resetModelCaches = require('./cacheManagement').resetModelCaches;
  resetModelCaches();
};
