
// Re-export all model cache functionality from the modular files
export { 
  getModelCache,
  setBestModelCache,
  setCombinedModelCache,
  resetModelCaches
} from './cacheManagement';

export {
  incrementGeneration,
  incrementGenerationAfterVictory,
  updateCurrentGeneration,
  forceGenerationUpdate,
  getCurrentGeneration,
  advanceGenerationBasedOnMetrics,
  purgeAllModelCaches
} from './generationTracking';

export {
  trackGamePlayed,
  getGamesSinceLastIncrement,
  resetGamesSinceLastIncrement,
  updateHighestScore,
  getHighestScore
} from './gameTracking';

export {
  updateHighestScoreAchieved,
  getCurrentHighestScore,
  resetHighestScore
} from './scoreTracking';
