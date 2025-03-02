
import { NeuralNetwork as INeuralNetwork } from "../../types";
import { NeuralNetwork } from "../../NeuralNetwork";
import { 
  getModelCache, 
  setCombinedModelCache, 
  forceGenerationUpdate 
} from "../../hooks/snakeCreation/modelCache";
import { combineModels } from "../../evolution/combineModels";
import { loadAllModels } from "./allModelsLoader";

/**
 * Gets a combined model from multiple top-performing models
 * Handles caching, error recovery, and generation progression
 */
export const getCombinedModel = async (count: number = 5): Promise<INeuralNetwork | null> => {
  try {
    // Check global cache first
    const { combinedModelCache, currentGeneration } = getModelCache();
    if (combinedModelCache) {
      console.log(`Using cached combined model from global cache (generation ${combinedModelCache.getGeneration()})`);
      
      // Force generation increment for cached combined model
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
      // Set generation to at least 5
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
        // Force higher generation for the combined model
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
          // Always ensure significant generation progression
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
      return handleModelCombineError(topModels, currentGeneration);
    }
  } catch (err) {
    console.error("Exception in getCombinedModel:", err);
    // Return a new model as fallback
    const newModel = new NeuralNetwork(8, 12, 4);
    // Set generation to at least 10
    const { currentGeneration } = getModelCache();
    const newGeneration = Math.max(currentGeneration, 10) + 2;
    newModel.updateGeneration(newGeneration);
    forceGenerationUpdate(newGeneration);
    return newModel;
  }
}

/**
 * Handles errors that occur during model combination
 * Provides fallback strategies to ensure a model is always returned
 */
const handleModelCombineError = (
  topModels: INeuralNetwork[], 
  currentGeneration: number
): INeuralNetwork => {
  // If combining fails, return the best available model
  if (topModels.length > 0) {
    console.log("Fallback to best available model");
    // Always ensure significant generation progression
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
    // Set generation to at least 10
    const newGeneration = Math.max(currentGeneration, 10) + 2;
    newModel.updateGeneration(newGeneration);
    forceGenerationUpdate(newGeneration);
    return newModel;
  }
}
