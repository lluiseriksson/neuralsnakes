
import { NeuralNetwork } from "../NeuralNetwork";
import { NeuralNetwork as INeuralNetwork } from "../types";
import { mutateWeights, combineWeights } from "../neuralNetworkUtils";

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
    
    // Prepare models with their scores for weighted combination
    const modelData = models.map(model => ({
      weights: model.getWeights(),
      score: model.getBestScore(),
      generation: model.getGeneration()
    }));
    
    // Use weighted combination based on scores
    const { combinedWeights, newGeneration } = combineWeights(modelData, weightsLength);
    
    // Create a new model with the combined weights and incremented generation
    const combinedModel = new NeuralNetwork(8, 12, 4, combinedWeights, null, 0, newGeneration);
    
    // Add some mutation to explore new solutions
    // Higher mutation rate to avoid local optima
    const mutatedWeights = mutateWeights(combinedModel.getWeights(), 0.15, 0.25);
    combinedModel.setWeights(mutatedWeights);
    
    console.log(`Created combined model with generation ${newGeneration}`);
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
