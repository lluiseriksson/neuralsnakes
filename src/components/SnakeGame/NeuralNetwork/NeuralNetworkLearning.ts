
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
  
  // Calculate learning rate based on context
  // EXTREMELY more aggressive: highly amplified learning
  const learningRate = success 
    ? 0.5 * Math.min(reward, 4.0) // Cap at 2.0 for success (much higher)
    : 0.6 * Math.min(reward, 3.0); // Cap at 1.8 for failure (much higher)
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply adjustments to weights based on input values
  // This creates a correlation between input patterns and outcomes
  const newWeights = currentWeights.map((weight, index) => {
    // Only adjust weights related to active inputs
    // Using a more direct connection between inputs and outputs
    if (index < inputs.length * 4) { // Assuming 4 output neurons
      const inputIndex = Math.floor(index / 4);
      const outputIndex = index % 4;
      const inputValue = inputs[inputIndex];
      
      // Weight adjustment proportional to input value and learning outcome
      // Much stronger for significant inputs
      const inputStrength = Math.abs(inputValue) > 0.5 ? 3.0 : 2.0;
      const adjustment = inputValue * learningRate * inputStrength * (success ? 1 : -1);
      
      // For success, we GREATLY reinforce weights associated with the chosen direction
      if (success && outputs.length > 0 && outputs[outputIndex] > 0.5) {
        return weight + (adjustment * 5.0); // 500% more reinforcement for the chosen action
      }
      
      return weight + adjustment;
    }
    
    // For weights not related to inputs, make smaller random adjustments
    // But significant enough to explore new solutions
    const randomFactor = (Math.random() * 0.4 - 0.2) * (success ? 1 : -1);
    return weight + (randomFactor * learningRate);
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
      // Mutation: either a small adjustment or a complete reset
      if (Math.random() < 0.7) { // More probability for medium adjustments
        // Normal medium adjustment - follow a bell curve for more natural mutations
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        // Much larger adjustments for wider exploration
        return weight + gaussianRandom() * 1.5; 
      } else {
        // Complete reset (30% of the time) - allows exploring completely new solutions
        return Math.random() * 4 - 2; // Wider range [-2, 2]
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
