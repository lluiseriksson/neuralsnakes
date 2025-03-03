
import { NeuralNetwork } from "../NeuralNetwork";
import { NeuralNetwork as INeuralNetwork } from "../types";
import { mutateWeights, combineWeights } from "../neuralNetworkUtils";
import { getModelCache, incrementGeneration, updateCurrentGeneration } from "../hooks/snakeCreation/modelCache";

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
    
    // Sort models by score first to ensure best ones have more influence
    const sortedModels = [...models].sort((a, b) => b.getBestScore() - a.getBestScore());
    
    // Get the weight size from the first model
    const weightsArray = sortedModels[0].getWeights();
    const weightsLength = weightsArray.length;
    
    // Get current generation info
    const { currentGeneration } = getModelCache();
    
    // Prepare models with their scores for weighted combination
    const modelData = sortedModels.map(model => ({
      weights: model.getWeights(),
      score: model.getBestScore(),
      generation: model.getGeneration()
    }));
    
    // Use weighted combination based on scores
    const { combinedWeights, newGeneration } = combineWeights(modelData, weightsLength);
    
    // Calculate explicit new generation number - FORCE HIGHER PROGRESSION
    // Always increment by at least 15 to ensure faster evolution
    const explicitNewGeneration = Math.max(
      newGeneration,
      currentGeneration + 15, // Increased from 2 to 15
      Math.max(...sortedModels.map(m => m.getGeneration())) + 15 // Increased from 2 to 15
    );
    
    // Log the new generation calculation
    console.log(`New combined model generation calculated: ${explicitNewGeneration} (based on max ${Math.max(...sortedModels.map(m => m.getGeneration()))} and current ${currentGeneration})`);
    
    // Create a new model with the combined weights and explicitly set generation
    const combinedModel = new NeuralNetwork(
      8, 12, 4, 
      combinedWeights, 
      null, 
      0, 
      explicitNewGeneration
    );
    
    // Set best score based on parent models
    const bestParentScore = Math.max(...sortedModels.map(m => m.getBestScore()));
    if (bestParentScore > 0) {
      combinedModel.updateBestScore(bestParentScore * 0.9); // Slightly reduce to encourage improvement
    }
    
    // Add stronger mutation to explore new solutions
    // Much higher mutation rate to escape local optima
    const mutatedWeights = mutateWeights(combinedModel.getWeights(), 0.5, 0.8); // Increased mutation rates
    combinedModel.setWeights(mutatedWeights);
    
    // Make sure to update the global generation tracker
    updateCurrentGeneration(explicitNewGeneration);
    
    console.log(`Created combined model with generation ${combinedModel.getGeneration()}`);
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
