
import { supabase } from "@/integrations/supabase/client";

/**
 * Combines weights from multiple models giving higher influence to better scoring models
 */
export const combineWeights = (
  models: Array<{weights: unknown, score?: number | null, generation?: number | null}>, 
  weightsLength: number
): {combinedWeights: number[], newGeneration: number} => {
  // Calculate new weights combining the best models
  const combinedWeights = new Array(weightsLength).fill(0);
  
  let totalScore = models.reduce((sum, model) => sum + (model.score || 0), 0);
  if (totalScore === 0) totalScore = models.length; // Avoid division by zero
  
  for (const model of models) {
    const influence = (model.score || 0) / totalScore;
    const modelWeights = model.weights as unknown as number[];
    
    for (let i = 0; i < weightsLength; i++) {
      combinedWeights[i] += modelWeights[i] * influence;
    }
  }
  
  // Calculate the new generation
  const newGeneration = Math.max(...models.map(model => model.generation || 1)) + 1;
  
  return { combinedWeights, newGeneration };
};

/**
 * Applies random mutations to weights based on a mutation probability
 */
export const mutateWeights = (weights: number[], mutationProbability: number = 0.1, mutationRange: number = 0.2): number[] => {
  return weights.map(w => {
    if (Math.random() < mutationProbability) {
      return w + (Math.random() * mutationRange - mutationRange/2); // Small mutation
    }
    return w;
  });
};
