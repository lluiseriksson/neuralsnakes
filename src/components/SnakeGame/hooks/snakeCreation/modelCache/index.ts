
// Add window augmentation for TypeScript to recognize our custom events
declare global {
  interface WindowEventMap {
    'update-highest-score': CustomEvent<{ score: number }>;
    'new-high-score': CustomEvent<{ score: number }>;
  }
}

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
