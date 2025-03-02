
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
  
  // Calculate learning rate - more balanced approach
  // Lower base rates to prevent wild oscillations
  const baseRate = success ? 0.2 : 0.25; 
  const learningRate = baseRate * Math.min(reward, 2.0);
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply regularization to prevent overfitting
  const regularizationStrength = 0.01;
  
  // Apply adjustments to weights based on input values with regularization
  const newWeights = currentWeights.map((weight, index) => {
    // Only adjust weights related to active inputs
    if (index < inputs.length * 4) { // Assuming 4 output neurons
      const inputIndex = Math.floor(index / 4);
      const outputIndex = index % 4;
      const inputValue = inputs[inputIndex];
      
      // Weight adjustment proportional to input value and learning outcome
      const inputStrength = Math.abs(inputValue) > 0.5 ? 1.5 : 1.0;
      const adjustment = inputValue * learningRate * inputStrength * (success ? 1 : -1);
      
      // Apply stronger reinforcement for chosen action, but more moderately
      if (success && outputs.length > 0 && outputs[outputIndex] > 0.5) {
        // Add regularization term to prevent weights from growing too large
        const regularization = regularizationStrength * weight;
        return weight + (adjustment * 2.0) - regularization;
      }
      
      // Apply regularization to all weights
      const regularization = regularizationStrength * weight;
      return weight + adjustment - regularization;
    }
    
    // For weights not directly related to inputs, apply smaller adjustments
    // with regularization to prevent overfitting
    const randomFactor = (Math.random() * 0.2 - 0.1) * (success ? 1 : -1);
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
  mutationRate: number = 0.1
): void => {
  const weights = network.getWeights();
  
  const mutatedWeights = weights.map(weight => {
    // Apply mutation with probability mutationRate
    if (Math.random() < mutationRate) {
      if (Math.random() < 0.8) { // 80% chance for small to medium adjustments
        // Normal small-to-medium adjustment with bell curve distribution
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        // More moderate adjustments
        return weight + gaussianRandom() * 0.8; 
      } else {
        // Complete reset (20% of the time) - allows exploring completely new solutions
        return Math.random() * 3 - 1.5; // Range [-1.5, 1.5] - more moderate
      }
    }
    return weight;
  });
  
  network.setWeights(mutatedWeights);
}

export const cloneNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.1
): NeuralNetworkCore => {
  const inputSize = 8; // Standard input size
  const hiddenSize = 12; // Standard hidden size
  const outputSize = 4; // Standard output size
  
  const weights = network.getWeights();
  
  // IMPORTANT: Explicitly increment generation when cloning
  const nextGeneration = network.getGeneration() + 1;
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
