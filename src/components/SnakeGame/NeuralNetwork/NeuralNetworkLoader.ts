
import { NeuralNetwork as INeuralNetwork } from "../types";
import { NeuralNetwork } from "../NeuralNetwork";
import { fetchBestModelFromDb, fetchAllModelsFromDb } from "../database/modelFetching";
import { combineModels } from "../evolution/combineModels";
import { getModelCache, setBestModelCache, setCombinedModelCache, updateCurrentGeneration, incrementGeneration } from "../hooks/snakeCreation/modelCache";

export const loadBestModel = async (): Promise<INeuralNetwork | null> => {
  try {
    // First check the global cache
    const { bestModelCache } = getModelCache();
    if (bestModelCache) {
      console.log("Using cached best model from global cache");
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
    
    // Update the generation tracking system
    if (model.generation > 0) {
      updateCurrentGeneration(model.generation);
      // Also increment generation after loading to ensure progress
      incrementGeneration();
    }
    
    // Update global cache
    setBestModelCache(neuralNetwork);
    
    console.log(`Loaded best model with generation ${model.generation} and score ${model.score || 0}`);
    return neuralNetwork;
  } catch (err) {
    console.error('Exception loading best neural network:', err);
    return null;
  }
}

export const loadAllModels = async (): Promise<INeuralNetwork[]> => {
  try {
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
      
      // Update the generation tracking system for each model
      if (model.generation > 0) {
        updateCurrentGeneration(model.generation);
      }
      
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
    
    // Also increment generation after loading to ensure progress
    if (models.length > 0) {
      const maxGeneration = Math.max(...models.map(m => m.getGeneration()));
      if (maxGeneration > 0) {
        updateCurrentGeneration(maxGeneration);
        incrementGeneration();
      }
    }
    
    console.log(`Loaded ${models.length} models. Highest generation: ${Math.max(...models.map(m => m.getGeneration()))}`);
    return models;
  } catch (err) {
    console.error('Exception loading all neural networks from DB:', err);
    return [];
  }
}

export const getCombinedModel = async (count: number = 5): Promise<INeuralNetwork | null> => {
  try {
    // Check global cache first
    const { combinedModelCache, currentGeneration } = getModelCache();
    if (combinedModelCache) {
      console.log(`Using cached combined model from global cache (generation ${combinedModelCache.getGeneration()})`);
      return combinedModelCache;
    }
    
    const models = await loadAllModels();
    
    if (!models || models.length === 0) {
      console.log("No hay suficientes modelos para combinar, creando uno nuevo");
      
      // Create a new model if no existing models can be loaded
      const newModel = new NeuralNetwork(8, 12, 4);
      // Set generation to current + 1 to ensure progress
      newModel.updateGeneration(currentGeneration > 0 ? currentGeneration : 1);
      return newModel;
    }
    
    // Sort models by score in descending order
    const sortedModels = [...models].sort((a, b) => b.getBestScore() - a.getBestScore());
    
    // Limit to the requested number of top models
    const topModels = sortedModels.slice(0, count);
    console.log(`Using top ${topModels.length} models for combination`);
    
    // Try to combine the models
    try {
      const combinedModel = combineModels(topModels);
      
      if (combinedModel) {
        // Cache the combined model
        setCombinedModelCache(combinedModel);
        console.log(`Successfully created combined model with generation ${combinedModel.getGeneration()}`);
        
        // Ensure generation progress
        incrementGeneration();
        
        return combinedModel;
      } else {
        console.log("Model combination returned null, falling back to best model");
        // If we have a best model, make sure its generation is properly set
        if (topModels[0]) {
          // Always ensure generation progression
          const newGeneration = Math.max(currentGeneration + 1, topModels[0].getGeneration() + 1);
          topModels[0].updateGeneration(newGeneration);
          // Make sure we update the cache with the new generation
          setCombinedModelCache(topModels[0]);
        }
        return topModels[0];
      }
    } catch (combineErr) {
      console.error("Error combining models:", combineErr);
      
      // If combining fails, return the best available model
      if (topModels.length > 0) {
        console.log("Fallback to best available model");
        // Always ensure generation progression
        const newGeneration = Math.max(currentGeneration + 1, topModels[0].getGeneration() + 1);
        topModels[0].updateGeneration(newGeneration);
        // Make sure we update the cache with the new generation
        setCombinedModelCache(topModels[0]);
        return topModels[0];
      } else {
        // Last resort: create a new model
        console.log("Fallback to new model as last resort");
        const newModel = new NeuralNetwork(8, 12, 4);
        // Set generation to current + 1 to ensure progress
        newModel.updateGeneration(currentGeneration > 0 ? currentGeneration + 1 : 1);
        return newModel;
      }
    }
  } catch (err) {
    console.error("Exception in getCombinedModel:", err);
    // Return a new model as fallback
    const newModel = new NeuralNetwork(8, 12, 4);
    // Set generation to current + 1 to ensure progress
    const { currentGeneration } = getModelCache();
    newModel.updateGeneration(currentGeneration > 0 ? currentGeneration + 1 : 1);
    return newModel;
  }
}
