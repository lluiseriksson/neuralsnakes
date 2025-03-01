
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
    // Update currentGeneration when setting a new best model
    updateCurrentGeneration(model.getGeneration());
  }
};

export const setCombinedModelCache = (model: INeuralNetwork | null) => {
  combinedModelCache = model;
  if (model) {
    // Update currentGeneration when setting a new combined model
    updateCurrentGeneration(model.getGeneration());
  }
};

export const incrementGeneration = () => {
  currentGeneration += 1;
  console.log(`Generation incremented to ${currentGeneration}`);
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

export const resetModelCaches = () => {
  // Use this to clear caches between major game resets if needed
  bestModelCache = null;
  combinedModelCache = null;
};
