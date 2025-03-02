
import { NeuralNetwork as INeuralNetwork } from '../../types';

// Cache to avoid repeatedly loading models
let bestModelCache: INeuralNetwork | null = null;
let combinedModelCache: INeuralNetwork | null = null;
let currentGeneration = 1; // Track current generation

export const getModelCache = () => {
  return {
    bestModelCache,
    combinedModelCache,
    currentGeneration
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
    }
  }
};

export const incrementGeneration = () => {
  currentGeneration += 1;
  console.log(`Generation explicitly incremented to ${currentGeneration}`);
  return currentGeneration;
};

export const updateCurrentGeneration = (generation: number) => {
  // Always take the highest generation value
  if (generation > currentGeneration) {
    console.log(`Generation updated from ${currentGeneration} to ${generation}`);
    currentGeneration = generation;
  }
  return currentGeneration;
};

export const forceGenerationUpdate = (generation: number) => {
  // Force a specific generation value (use carefully)
  console.log(`Generation forcefully set from ${currentGeneration} to ${generation}`);
  currentGeneration = generation;
  return currentGeneration;
};

export const resetModelCaches = () => {
  // Use this to clear caches between major game resets if needed
  bestModelCache = null;
  combinedModelCache = null;
  // Do NOT reset currentGeneration here as we want to maintain progression
};
