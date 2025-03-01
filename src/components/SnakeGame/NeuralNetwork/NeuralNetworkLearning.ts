
import { NeuralNetworkCore } from "./NeuralNetworkCore";

export const applyLearning = (
  network: NeuralNetworkCore,
  success: boolean, 
  inputs: number[] = [], 
  outputs: number[] = [], 
  reward: number = 1
): void => {
  // Increment games played counter
  const gamesPlayed = network.getGamesPlayed() + 1;
  network.setGamesPlayed(gamesPlayed);
  
  // Skip learning if we don't have inputs (no context for learning)
  if (inputs.length === 0) return;
  
  // Calculate learning rate based on context
  // Faster learning for more significant events (higher rewards/penalties)
  const learningRate = success 
    ? 0.1 * Math.min(reward, 2) // Cap at 0.2 for success
    : 0.15 * Math.min(reward, 1.5); // Cap at 0.225 for failure
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply adjustments to weights based on input values
  // This creates a correlation between input patterns and outcomes
  const newWeights = currentWeights.map((weight, index) => {
    // Only adjust weights related to active inputs
    if (index < inputs.length * 4) { // Assuming 4 output neurons
      const inputIndex = Math.floor(index / 4);
      const inputValue = inputs[inputIndex];
      
      // Adjust weight proportionally to input value and learning outcome
      const adjustment = inputValue * learningRate * (success ? 1 : -1);
      return weight + adjustment;
    }
    
    // For non-input related weights, make smaller random adjustments
    const randomFactor = (Math.random() * 0.1 - 0.05) * (success ? 1 : -1);
    return weight + (randomFactor * learningRate);
  });
  
  // Set new weights
  network.setWeights(newWeights);
  
  // Save training data for later analysis
  if (network.getId() && inputs.length > 0) {
    network.saveTrainingData(inputs, outputs, success);
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
      // Mutation: either small adjustment or complete reset
      if (Math.random() < 0.9) {
        // Normal small adjustment - following a bell curve for more natural mutations
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        return weight + gaussianRandom() * 0.3; // Smaller adjustments for stability
      } else {
        return Math.random() * 2 - 1; // Complete reset (rarely)
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
  const inputSize = 8; // Assuming standard input size 
  const hiddenSize = 12; // Assuming standard hidden size
  const outputSize = 4; // Assuming standard output size
  
  const weights = network.getWeights();
  const clone = new NeuralNetworkCore(
    inputSize, 
    hiddenSize, 
    outputSize, 
    weights,
    network.getId(),
    network.getBestScore(),
    network.getGeneration() + 1,
    network.getBestScore(),
    0 // Reset games played
  );
  
  // Apply mutations with probability mutationRate
  if (mutationRate > 0) {
    mutateNetwork(clone, mutationRate);
  }
  
  return clone;
}
