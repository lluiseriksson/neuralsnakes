
// Re-export all model cache functionality from the modular files
export { 
  getModelCache,
  setBestModelCache,
  setCombinedModelCache,
  resetModelCaches
} from './cacheManagement';

export {
  incrementGeneration,
  updateCurrentGeneration,
  forceGenerationUpdate,
  getCurrentGeneration,
  advanceGenerationBasedOnMetrics,
  purgeAllModelCaches
} from './generationTracking';

export {
  trackGamePlayed,
  getGamesSinceLastIncrement,
  resetGamesSinceLastIncrement
} from './gameTracking';
