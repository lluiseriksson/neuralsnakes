
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
  getCurrentGeneration
} from './generationTracking';

export {
  trackGamePlayed,
  getGamesSinceLastIncrement
} from './gameTracking';
