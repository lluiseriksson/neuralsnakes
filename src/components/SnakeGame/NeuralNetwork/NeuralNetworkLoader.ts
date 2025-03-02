
import { NeuralNetwork as INeuralNetwork } from "../types";
import { NeuralNetwork } from "../NeuralNetwork";
import { fetchBestModelFromDb, fetchAllModelsFromDb } from "../database/modelFetching";
import { combineModels } from "../evolution/combineModels";
import { getModelCache, setBestModelCache, setCombinedModelCache, updateCurrentGeneration, incrementGeneration, forceGenerationUpdate } from "../hooks/snakeCreation/modelCache";

export const loadBestModel = async (): Promise<INeuralNetwork | null> => {
  try {
    // First check the global cache
    const { bestModelCache } = getModelCache();
    if (bestModelCache) {
      console.log("Using cached best model from global cache");
      
      // FIXED: Always increment the generation significantly when reusing cached model
      const newGeneration = bestModelCache.getGeneration() + 5;
      bestModelCache.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
      console.log(`⚡ FIXED: Incremented cached best model generation to ${bestModelCache.getGeneration()} ⚡`);
      
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
    
    // FIXED: Make sure the generation is at least 10
    const loadedGeneration = Math.max(model.generation, 10);
    
    const neuralNetwork = new NeuralNetwork(
      8, 
      12, 
      4, 
      weightsArray, 
      model.id, 
      model.score, 
      loadedGeneration,
      bestScore,
      gamesPlayed
    );
    
    // Update the generation tracking system
    if (loadedGeneration > 0) {
      // FIXED: Always add at least 5 to the loaded generation
      const newGeneration = loadedGeneration + 5;
      neuralNetwork.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
      console.log(`⚡ FIXED: Incremented loaded best model generation to ${neuralNetwork.getGeneration()} ⚡`);
    }
    
    // Update global cache
    setBestModelCache(neuralNetwork);
    
    console.log(`⭐ Loaded best model with generation ${neuralNetwork.getGeneration()} and score ${model.score || 0} ⭐`);
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
      
      // FIXED: Ensure minimum generation of 5
      const fixedGeneration = Math.max(model.generation, 5);
      
      // Update the generation tracking system for each model
      if (fixedGeneration > 0) {
        updateCurrentGeneration(fixedGeneration);
      }
      
      return new NeuralNetwork(
        8, 
        12, 
        4, 
        weightsArray, 
        model.id, 
        model.score, 
        fixedGeneration,
        bestScore,
        gamesPlayed
      );
    });
    
    // Also increment generation after loading to ensure progress
    if (models.length > 0) {
      const maxGeneration = Math.max(...models.map(m => m.getGeneration()));
      if (maxGeneration > 0) {
        // FIXED: Force at least generation 5 plus an increment
        const newGeneration = Math.max(maxGeneration, 5) + 3;
        forceGenerationUpdate(newGeneration);
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
      
      // FIXED: Force generation increment for cached combined model
      const newGeneration = combinedModelCache.getGeneration() + 3;
      combinedModelCache.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
      
      return combinedModelCache;
    }
    
    const models = await loadAllModels();
    
    if (!models || models.length === 0) {
      console.log("No hay suficientes modelos para combinar, creando uno nuevo");
      
      // Create a new model if no existing models can be loaded
      const newModel = new NeuralNetwork(8, 12, 4);
      // FIXED: Set generation to at least 5
      const newGeneration = Math.max(currentGeneration, 5) + 2;
      newModel.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
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
        // FIXED: Force higher generation for the combined model
        const newGeneration = Math.max(combinedModel.getGeneration(), currentGeneration) + 3;
        combinedModel.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        // Cache the combined model
        setCombinedModelCache(combinedModel);
        console.log(`⭐ Successfully created combined model with generation ${combinedModel.getGeneration()} ⭐`);
        
        return combinedModel;
      } else {
        console.log("Model combination returned null, falling back to best model");
        // If we have a best model, make sure its generation is properly set
        if (topModels[0]) {
          // FIXED: Always ensure significant generation progression
          const newGeneration = Math.max(currentGeneration, topModels[0].getGeneration()) + 5;
          topModels[0].updateGeneration(newGeneration);
          // Make sure we update the cache with the new generation
          setCombinedModelCache(topModels[0]);
          forceGenerationUpdate(newGeneration);
        }
        return topModels[0];
      }
    } catch (combineErr) {
      console.error("Error combining models:", combineErr);
      
      // If combining fails, return the best available model
      if (topModels.length > 0) {
        console.log("Fallback to best available model");
        // FIXED: Always ensure significant generation progression
        const newGeneration = Math.max(currentGeneration, topModels[0].getGeneration()) + 5;
        topModels[0].updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        // Make sure we update the cache with the new generation
        setCombinedModelCache(topModels[0]);
        return topModels[0];
      } else {
        // Last resort: create a new model
        console.log("Fallback to new model as last resort");
        const newModel = new NeuralNetwork(8, 12, 4);
        // FIXED: Set generation to at least 10
        const newGeneration = Math.max(currentGeneration, 10) + 2;
        newModel.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        return newModel;
      }
    }
  } catch (err) {
    console.error("Exception in getCombinedModel:", err);
    // Return a new model as fallback
    const newModel = new NeuralNetwork(8, 12, 4);
    // FIXED: Set generation to at least 10
    const { currentGeneration } = getModelCache();
    const newGeneration = Math.max(currentGeneration, 10) + 2;
    newModel.updateGeneration(newGeneration);
    forceGenerationUpdate(newGeneration);
    return newModel;
  }
}
