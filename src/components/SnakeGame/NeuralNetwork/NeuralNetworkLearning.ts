
import { NeuralNetworkCore } from "./NeuralNetworkCore";

export const applyLearning = (
  network: NeuralNetworkCore,
  success: boolean, 
  inputs: number[] = [], 
  outputs: number[] = [], 
  reward: number = 1
): void => {
  // Skip learning if we don't have inputs (no context for learning)
  if (inputs.length === 0) {
    console.log("Skipping learning: no inputs provided");
    return;
  }
  
  // Track learning attempt
  network.trackLearningAttempt(success);
  
  // Calculate learning rate with adaptive approach based on generation
  // Higher generations get smaller learning rates to fine-tune rather than drastically change
  const generation = network.getGeneration();
  const adaptiveFactor = Math.max(0.3, 1.0 - (generation / 150)); // Adjusted curve, slower decay, increased minimum
  
  // Calculate learning rate - more moderate approach
  const baseRate = success ? 0.4 * adaptiveFactor : 0.5 * adaptiveFactor; // Reduced from 0.6/0.7 to 0.4/0.5
  // Cap maximum reward to prevent wild oscillations
  const learningRate = baseRate * Math.min(reward, 2.0); // Reduced cap from 3.5 to 2.0
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply regularization to prevent overfitting - stronger for higher generations
  const regularizationStrength = 0.002 + (generation / 35000); // Reduced strength to allow more learning
  
  // Apply adjustments to weights based on input values with regularization
  const newWeights = currentWeights.map((weight, index) => {
    // Only adjust weights related to active inputs
    if (index < inputs.length * 4) { // Assuming 4 output neurons
      const inputIndex = Math.floor(index / 4);
      const outputIndex = index % 4;
      const inputValue = inputs[inputIndex];
      
      // Weight adjustment proportional to input value and learning outcome
      const inputStrength = Math.abs(inputValue) > 0.5 ? 2.0 : 1.0; // Reduced from 2.5 to 2.0
      // More nuanced adjustment based on success/failure
      const adjustment = inputValue * learningRate * inputStrength * (success ? 1 : -1);
      
      // Apply stronger reinforcement for chosen action with gradient
      if (success && outputs.length > 0) {
        const outputConfidence = outputs[outputIndex];
        // Scale reinforcement based on the confidence of the output
        const confidenceBonus = outputConfidence > 0.5 ? 2.0 : 1.0; // Reduced from 3.5 to 2.0
        
        // Apply regularization term to prevent weights from growing too large
        const regularization = regularizationStrength * weight;
        return weight + (adjustment * confidenceBonus) - regularization;
      }
      
      // Apply regularization to all weights
      const regularization = regularizationStrength * weight;
      return weight + adjustment - regularization;
    }
    
    // For weights not directly related to inputs, apply smaller adjustments
    // with regularization to prevent overfitting
    const randomFactor = (Math.random() * 0.2 - 0.1) * (success ? 1 : -1); // Reduced from 0.4-0.2 to 0.2-0.1
    const regularization = regularizationStrength * weight;
    return weight + (randomFactor * learningRate) - regularization;
  });
  
  // Set new weights
  network.setWeights(newWeights);
  
  // Save training data for later analysis
  if (network.getId() && inputs.length > 0) {
    network.saveTrainingData(inputs, outputs, success).catch(err => {
      console.log("Error saving training data, but continuing", err);
    });
  }
}

export const mutateNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.25 // Increased from 0.2 to 0.25
): void => {
  const weights = network.getWeights();
  const generation = network.getGeneration();
  
  // Adaptive mutation - less decay for higher generations to maintain exploration
  const adaptiveMutationRate = mutationRate * Math.max(0.3, 1.0 - (generation / 300)); // Adjusted curve, higher minimum
  
  // Track how often a weight is actually mutated
  let mutationCount = 0;
  
  const mutatedWeights = weights.map(weight => {
    // Apply mutation with probability adaptiveMutationRate
    if (Math.random() < adaptiveMutationRate) {
      mutationCount++;
      
      if (Math.random() < 0.7) { // Reduced from 0.8 to 0.7 for more radical mutations
        // Normal adjustment with bell curve distribution for more natural mutations
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        // Adaptive mutation strength - more precise for higher generations
        const adaptiveStrength = Math.max(0.3, 1.0 - (generation / 400)); // Increased minimum from 0.2 to 0.3
        return weight + gaussianRandom() * adaptiveStrength * 1.0; // Reduced from 1.5 to 1.0 for more stability
      } else {
        // Complete reset (30% of the time) - allows exploring completely new solutions
        // More contained range for more stable evolution
        return Math.random() * 4 - 2; // Reduced range from [-3, 3] to [-2, 2]
      }
    }
    return weight;
  });
  
  console.log(`Applied mutations to ${mutationCount} weights (${((mutationCount/weights.length)*100).toFixed(1)}%) with rate ${adaptiveMutationRate.toFixed(4)}`);
  
  network.setWeights(mutatedWeights);
}

export const cloneNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.25 // Increased from 0.2 to 0.25
): NeuralNetworkCore => {
  const inputSize = 8; // Standard input size
  const hiddenSize = 12; // Standard hidden size
  const outputSize = 4; // Standard output size
  
  const weights = network.getWeights();
  
  // More moderate generational increment for more stable evolution
  const nextGeneration = network.getGeneration() + 3; // Reduced from 15 to 3
  console.log(`Cloning network: incrementing generation from ${network.getGeneration()} to ${nextGeneration}`);
  
  const clone = new NeuralNetworkCore(
    inputSize, 
    hiddenSize, 
    outputSize, 
    weights,
    null, // New ID for clone
    0, // Reset score for new clone
    nextGeneration, // Increment generation
    network.getBestScore(),
    0 // Reset games played
  );
  
  // Apply mutations with probability mutationRate
  if (mutationRate > 0) {
    mutateNetwork(clone, mutationRate);
  }
  
  return clone;
}
