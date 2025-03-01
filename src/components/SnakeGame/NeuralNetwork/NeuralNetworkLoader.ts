
import { NeuralNetwork as INeuralNetwork } from "../types";
import { NeuralNetwork } from "../NeuralNetwork";
import { fetchBestModelFromDb, fetchAllModelsFromDb } from "../database/neuralNetworkDb";
import { combineModels } from "../evolution/modelEvolution";

// Cache loaded models to prevent repeated loading failures
let bestModelCache: INeuralNetwork | null = null;
let allModelsCache: INeuralNetwork[] | null = null;

export const loadBestModel = async (): Promise<INeuralNetwork | null> => {
  try {
    // First check the cache
    if (bestModelCache) {
      console.log("Using cached best model");
      return bestModelCache;
    }
    
    const model = await fetchBestModelFromDb();
    if (!model) {
      console.log("No best model found, returning null");
      return null;
    }
    
    // Ensure weights is treated as number[]
    const weightsArray = model.weights as unknown as number[];
    
    // Extract metadata if available
    const metadata = model.metadata as Record<string, any> || {};
    const bestScore = metadata.best_score || model.score || 0;
    const gamesPlayed = metadata.games_played || 0;
    
    const neuralNetwork = new NeuralNetwork(
      8, 
      12, 
      4, 
      weightsArray, 
      model.id, 
      model.score, 
      model.generation,
      bestScore,
      gamesPlayed
    );
    
    // Update cache
    bestModelCache = neuralNetwork;
    
    return neuralNetwork;
  } catch (err) {
    console.error('Exception loading best neural network:', err);
    return null;
  }
}

export const loadAllModels = async (): Promise<INeuralNetwork[]> => {
  try {
    // First check the cache
    if (allModelsCache && allModelsCache.length > 0) {
      console.log(`Using cached models (${allModelsCache.length})`);
      return [...allModelsCache]; // Return a copy to prevent mutation
    }
    
    const data = await fetchAllModelsFromDb();
    
    if (!data || data.length === 0) {
      console.log("No models found");
      return [];
    }
    
    const models = data.map(model => {
      // Ensure weights is treated as number[]
      const weightsArray = model.weights as unknown as number[];
      
      // Extract metadata if available
      const metadata = model.metadata as Record<string, any> || {};
      const bestScore = metadata.best_score || model.score || 0;
      const gamesPlayed = metadata.games_played || 0;
      
      return new NeuralNetwork(
        8, 
        12, 
        4, 
        weightsArray, 
        model.id, 
        model.score, 
        model.generation,
        bestScore,
        gamesPlayed
      );
    });
    
    // Update cache
    allModelsCache = models;
    
    return models;
  } catch (err) {
    console.error('Exception loading all neural networks:', err);
    return [];
  }
}

export const getCombinedModel = async (count: number = 5): Promise<INeuralNetwork | null> => {
  try {
    const models = await loadAllModels();
    
    if (!models || models.length === 0) {
      console.error("Error loading models for combination: No models found");
      console.log("No hay suficientes modelos para combinar, creando uno nuevo");
      
      // Create a new model if no existing models can be loaded
      const newModel = new NeuralNetwork(8, 12, 4);
      return newModel;
    }
    
    // Limit to the requested number of top models
    const topModels = models.slice(0, count);
    
    // Try to combine the models
    try {
      // Fix: Pass the array of models to combineModels
      return combineModels(topModels);
    } catch (combineErr) {
      console.error("Error combining models:", combineErr);
      
      // If combining fails, return the best available model
      if (topModels.length > 0) {
        console.log("Fallback to best available model");
        return topModels[0];
      } else {
        // Last resort: create a new model
        console.log("Fallback to new model as last resort");
        return new NeuralNetwork(8, 12, 4);
      }
    }
  } catch (err) {
    console.error("Exception in getCombinedModel:", err);
    // Return a new model as fallback
    return new NeuralNetwork(8, 12, 4);
  }
}
