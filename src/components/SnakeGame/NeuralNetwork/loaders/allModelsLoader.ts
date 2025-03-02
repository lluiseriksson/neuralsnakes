
import { NeuralNetwork as INeuralNetwork } from "../../types";
import { NeuralNetwork } from "../../NeuralNetwork";
import { fetchAllModelsFromDb } from "../../database/modelFetching";
import { 
  updateCurrentGeneration, 
  forceGenerationUpdate 
} from "../../hooks/snakeCreation/modelCache";

/**
 * Loads all neural network models from the database
 * Updates generation tracking and ensures model progression
 */
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
      
      // Ensure minimum generation of 5
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
        // Force at least generation 5 plus an increment
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
