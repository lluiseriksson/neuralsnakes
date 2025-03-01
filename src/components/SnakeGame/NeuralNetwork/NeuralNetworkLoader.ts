
import { NeuralNetwork as INeuralNetwork } from "../types";
import { NeuralNetwork } from "../NeuralNetwork";
import { fetchBestModelFromDb, fetchAllModelsFromDb } from "../database/neuralNetworkDb";
import { combineModels } from "../evolution/modelEvolution";

export const loadBestModel = async (): Promise<INeuralNetwork | null> => {
  try {
    const model = await fetchBestModelFromDb();
    if (!model) return null;
    
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
  } catch (err) {
    console.error('Exception loading best neural network:', err);
    return null;
  }
}

export const loadAllModels = async (): Promise<INeuralNetwork[]> => {
  try {
    const data = await fetchAllModelsFromDb();
    
    return data.map(model => {
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
  } catch (err) {
    console.error('Exception loading all neural networks:', err);
    return [];
  }
}

export const getCombinedModel = async (count: number = 5): Promise<INeuralNetwork | null> => {
  return combineModels(count);
}
