
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
    
    // FIXED: Calculate more reasonable new generation number
    // Only increment by 1 to avoid generation inflation
    const explicitNewGeneration = currentGeneration + 1;
    
    // Log the new generation calculation
    console.log(`New combined model generation calculated: ${explicitNewGeneration} (based on current ${currentGeneration})`);
    
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
      combinedModel.updateBestScore(bestParentScore * 0.8); // Slightly reduce to encourage improvement
    }
    
    // Add mutation to explore new solutions - more moderate mutation rate
    const mutatedWeights = mutateWeights(combinedModel.getWeights(), 0.35, 0.4);
    combinedModel.setWeights(mutatedWeights);
    
    // FIXED: Don't update global generation from combined model (potential source of inflation)
    // Leave current global generation as is
    
    console.log(`Created combined model with generation ${combinedModel.getGeneration()}`);
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
