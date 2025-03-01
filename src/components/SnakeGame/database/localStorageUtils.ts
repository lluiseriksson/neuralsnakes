
import { NeuralNetworkModel } from "../types";
import { LOCAL_STORAGE_KEY_BEST_MODEL, LOCAL_STORAGE_KEY_ALL_MODELS } from "./config";

/**
 * Generate a client-side ID when database is unavailable
 */
export const generateClientId = (): string => {
  return 'client-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Load best model from localStorage
 */
export const loadBestModelFromLocalStorage = (): NeuralNetworkModel | null => {
  try {
    const storedModel = localStorage.getItem(LOCAL_STORAGE_KEY_BEST_MODEL);
    if (!storedModel) {
      console.log('No model found in localStorage');
      return null;
    }
    
    return JSON.parse(storedModel) as NeuralNetworkModel;
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return null;
  }
};

/**
 * Load all models from localStorage
 */
export const loadAllModelsFromLocalStorage = (): NeuralNetworkModel[] => {
  try {
    const storedModels = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_MODELS);
    if (!storedModels) {
      return [];
    }
    
    return JSON.parse(storedModels) as NeuralNetworkModel[];
  } catch (err) {
    console.error('Error loading all models from localStorage:', err);
    return [];
  }
};

/**
 * Save model to localStorage
 */
export const saveModelToLocalStorage = (
  model: NeuralNetworkModel
): void => {
  try {
    // Save in all models collection
    const allModels = loadAllModelsFromLocalStorage();
    const existingModelIndex = allModels.findIndex(m => m.id === model.id);
    
    if (existingModelIndex >= 0) {
      allModels[existingModelIndex] = model;
    } else {
      allModels.push(model);
    }
    
    // Sort by score descending
    allModels.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_MODELS, JSON.stringify(allModels));
    
    // Update best model if this is now the best
    const bestModel = loadBestModelFromLocalStorage();
    if (!bestModel || (bestModel.score || 0) < (model.score || 0)) {
      localStorage.setItem(LOCAL_STORAGE_KEY_BEST_MODEL, JSON.stringify(model));
    }
  } catch (storageErr) {
    console.warn('Error saving to localStorage:', storageErr);
  }
};
