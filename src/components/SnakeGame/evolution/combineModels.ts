
import { NeuralNetwork } from "../NeuralNetwork";
import { NeuralNetwork as INeuralNetwork } from "../types";
import { mutateWeights } from "../neuralNetworkUtils";

/**
 * Combines multiple models to create a new evolved model
 */
export const combineModels = (models: INeuralNetwork[]): INeuralNetwork | null => {
  try {
    if (!models || models.length === 0) {
      console.error('Error combining models: No models provided');
      return null;
    }
    
    console.log(`Combining ${models.length} models`);
    
    // Get the weight size from the first model
    const weightsArray = models[0].getWeights();
    const weightsLength = weightsArray.length;
    
    // Calculate average weights
    const combinedWeights = new Array(weightsLength).fill(0);
    let maxGeneration = 0;
    
    for (const model of models) {
      const weights = model.getWeights();
      maxGeneration = Math.max(maxGeneration, model.getGeneration());
      
      for (let i = 0; i < weightsLength; i++) {
        combinedWeights[i] += weights[i] / models.length;
      }
    }
    
    // Create a new model with the combined weights and incremented generation
    const newGeneration = maxGeneration + 1;
    const combinedModel = new NeuralNetwork(8, 12, 4, combinedWeights, null, 0, newGeneration);
    
    // Add some mutation to explore new solutions
    // Higher mutation rate to avoid local optima
    const mutatedWeights = mutateWeights(combinedModel.getWeights(), 0.2, 0.3);
    combinedModel.setWeights(mutatedWeights);
    
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
