
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
  
  // If we don't have valid scores, use equal weights
  let totalScore = models.reduce((sum, model) => sum + (model.score || 0), 0);
  if (totalScore === 0) totalScore = models.length; // Avoid division by zero
  
  // Calculate exponential weights to give more influence to better models
  // This makes the best models have MUCH more influence than lower scoring ones
  const scores = models.map(model => Math.max(model.score || 0, 0.1));
  const maxScore = Math.max(...scores);
  const influences = scores.map(score => Math.pow(score / maxScore, 2));
  const totalInfluence = influences.reduce((sum, inf) => sum + inf, 0);
  
  // Normalize influences
  const normalizedInfluences = influences.map(inf => inf / totalInfluence);
  
  // Apply influence-weighted combination
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const influence = normalizedInfluences[i];
    const modelWeights = model.weights as unknown as number[];
    
    for (let j = 0; j < weightsLength; j++) {
      combinedWeights[j] += modelWeights[j] * influence;
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
      // Use normal distribution for more natural mutations
      // This creates a bell curve of mutations centered on the current weight
      const gaussianRandom = () => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      };
      
      return w + gaussianRandom() * mutationRange;
    }
    return w;
  });
};
