
import { NeuralNetwork } from "../NeuralNetwork";
import { NeuralNetworkModel } from "../types";
import { combineWeights, mutateWeights } from "../neuralNetworkUtils";
import { fetchAllModelsFromDb, saveModelToDb } from "../database/neuralNetworkDb";

/**
 * Combines multiple models to create a new evolved model
 */
export const combineModels = async (count: number = 5): Promise<NeuralNetwork | null> => {
  try {
    const data = await fetchAllModelsFromDb();
    
    if (!data || data.length === 0) {
      console.error('Error loading models for combination: No models found');
      return null;
    }
    
    // Sort models by score (best first)
    const sortedModels = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Limit to the requested count
    const topModels = sortedModels.slice(0, count);
    
    console.log(`Combining top ${topModels.length} models with scores:`, topModels.map(m => m.score));
    
    // Get the weight size from the first model
    const weightsArray = topModels[0].weights as unknown as number[];
    const weightsLength = weightsArray.length;
    
    // Calculate combined weights
    const { combinedWeights, newGeneration } = combineWeights(topModels, weightsLength);
    
    // Create a new model with the combined weights
    const combinedModel = new NeuralNetwork(8, 12, 4, combinedWeights, null, 0, newGeneration);
    
    // Add some mutation to explore new solutions
    // Higher mutation rate to avoid local optima
    const mutatedWeights = mutateWeights(combinedModel.getWeights(), 0.2, 0.3);
    combinedModel.setWeights(mutatedWeights);
    
    // Save the combined model
    await combinedModel.save(0);
    
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
