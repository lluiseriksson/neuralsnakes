
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
};

export const setCombinedModelCache = (model: INeuralNetwork | null) => {
  combinedModelCache = model;
};

export const incrementGeneration = () => {
  currentGeneration += 1;
  return currentGeneration;
};

export const updateCurrentGeneration = (generation: number) => {
  currentGeneration = Math.max(currentGeneration, generation);
  return currentGeneration;
};
