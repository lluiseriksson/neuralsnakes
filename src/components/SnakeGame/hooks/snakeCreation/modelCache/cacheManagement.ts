
import { NeuralNetwork as INeuralNetwork } from '../../../types';
import { getCurrentGeneration, updateCurrentGeneration } from './generationTracking';

// Cache to avoid repeatedly loading models
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;

export const getModelCache = () => {
  return {
    bestModelCache,
    combinedModelCache,
    currentGeneration: getCurrentGeneration(),
    gamesSinceLastGenIncrement: getGamesSinceLastIncrement()
  };
};

export const setBestModelCache = (model: INeuralNetwork | null) => {
  bestModelCache = model;
  if (model) {
    // Always take the highest generation number
    const modelGeneration = model.getGeneration();
    if (modelGeneration > getCurrentGeneration()) {
      console.log(`⚡ CACHE UPDATE: Updating generation from ${getCurrentGeneration()} to ${modelGeneration} from best model ⚡`);
      updateCurrentGeneration(modelGeneration);
    }
  }
};

export const setCombinedModelCache = (model: INeuralNetwork | null) => {
  combinedModelCache = model;
  if (model) {
    // Always take the highest generation number 
    const modelGeneration = model.getGeneration();
    if (modelGeneration > getCurrentGeneration()) {
      console.log(`⚡ CACHE UPDATE: Updating generation from ${getCurrentGeneration()} to ${modelGeneration} from combined model ⚡`);
      updateCurrentGeneration(modelGeneration);
    }
  }
};

export const resetModelCaches = () => {
  // FIXED: Reset model caches more frequently to force fresh models
  console.log("Resetting model caches (but keeping generation number)");
  bestModelCache = null;
  combinedModelCache = null;
  // FIXED: Also increase generation when resetting caches to ensure progression
  updateCurrentGeneration(getCurrentGeneration() + 2);
  console.log(`⚡ Generation after cache reset: ${getCurrentGeneration()} ⚡`);
};

// Import from gameTracking
import { getGamesSinceLastIncrement } from './gameTracking';
