
import { NeuralNetwork as INeuralNetwork } from "../../types";
import { NeuralNetwork } from "../../NeuralNetwork";
import { fetchBestModelFromDb } from "../../database/modelFetching";
import { 
  getModelCache, 
  setBestModelCache, 
  forceGenerationUpdate 
} from "../../hooks/snakeCreation/modelCache";

/**
 * Loads the best performing neural network model
 * First checks cache, then database, and applies generation updates
 */
export const loadBestModel = async (): Promise<INeuralNetwork | null> => {
  try {
    // First check the global cache
    const { bestModelCache } = getModelCache();
    if (bestModelCache) {
      console.log("Using cached best model from global cache");
      
      // Always increment the generation significantly when reusing cached model
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
    
    // Make sure the generation is at least 10
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
      // Always add at least 5 to the loaded generation
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
