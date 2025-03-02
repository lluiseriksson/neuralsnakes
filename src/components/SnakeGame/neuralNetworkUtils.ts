
import { supabase } from "@/integrations/supabase/client";

/**
 * Combines weights from multiple models giving higher influence to better scoring models
 * with enhanced weighting algorithm
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
  
  // Enhanced exponential weighting to give much more influence to better models
  // This makes the best models have EXPONENTIALLY more influence than lower scoring ones
  const scores = models.map(model => Math.max(model.score || 0, 0.1));
  const maxScore = Math.max(...scores);
  
  // Use cubic power for even more dramatic weighting difference
  const influences = scores.map(score => Math.pow(score / maxScore, 3));
  const totalInfluence = influences.reduce((sum, inf) => sum + inf, 0);
  
  // Normalize influences
  const normalizedInfluences = influences.map(inf => inf / totalInfluence);
  
  console.log(`Model influence distribution:`, normalizedInfluences.map(inf => (inf * 100).toFixed(1) + '%').join(', '));
  
  // Apply influence-weighted combination
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const influence = normalizedInfluences[i];
    const modelWeights = model.weights as unknown as number[];
    
    for (let j = 0; j < weightsLength; j++) {
      combinedWeights[j] += modelWeights[j] * influence;
    }
  }
  
  // Calculate the new generation - take maximum and add a significant boost
  const newGeneration = Math.max(...models.map(model => model.generation || 1)) + 20;
  
  return { combinedWeights, newGeneration };
};

/**
 * Applies random mutations to weights based on a mutation probability
 * with enhanced mutation strategies
 */
export const mutateWeights = (weights: number[], mutationProbability: number = 0.1, mutationRange: number = 0.2): number[] => {
  // Count total mutations for logging
  let mutationCount = 0;
  
  return weights.map(w => {
    if (Math.random() < mutationProbability) {
      mutationCount++;
      
      // Use different mutation strategies with different probabilities
      const strategy = Math.random();
      
      if (strategy < 0.7) {
        // 70% chance: Normal distribution for more natural mutations
        // This creates a bell curve of mutations centered on the current weight
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random();
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        return w + gaussianRandom() * mutationRange;
      } 
      else if (strategy < 0.9) {
        // 20% chance: Sign flip with small adjustment (create opposite behaviors)
        return -w * (0.8 + Math.random() * 0.4); // Flip sign and adjust magnitude slightly
      }
      else {
        // 10% chance: Complete reset to random value for more exploration
        return (Math.random() * 2 - 1) * 2; // Range [-2, 2]
      }
    }
    return w;
  });
};

// Utility function to calculate the diversity of a set of models
export const calculateModelDiversity = (models: Array<{weights: unknown}>): number => {
  if (models.length <= 1) return 0;
  
  // Extract all weight arrays
  const weightArrays = models.map(model => model.weights as unknown as number[]);
  
  // Calculate average Euclidean distance between all pairs of models
  let totalDistance = 0;
  let pairCount = 0;
  
  for (let i = 0; i < weightArrays.length; i++) {
    for (let j = i + 1; j < weightArrays.length; j++) {
      // Calculate Euclidean distance between two weight arrays
      let squaredDistance = 0;
      const minLength = Math.min(weightArrays[i].length, weightArrays[j].length);
      
      for (let k = 0; k < minLength; k++) {
        const diff = weightArrays[i][k] - weightArrays[j][k];
        squaredDistance += diff * diff;
      }
      
      totalDistance += Math.sqrt(squaredDistance);
      pairCount++;
    }
  }
  
  // Return average distance
  return pairCount > 0 ? totalDistance / pairCount : 0;
};
