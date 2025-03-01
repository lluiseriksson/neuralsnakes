
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
  
  // Higher reward for better performance, stronger negative feedback for failures
  // Increased learning rate to accelerate learning
  const learningRate = success ? 0.15 * reward : 0.2;
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply adjustments based on game results
  // For success, move weights in the positive direction that led to success
  // For failure, move weights in the opposite direction that led to failure
  const newWeights = currentWeights.map(weight => 
    weight + (success ? 1 : -1) * learningRate * (Math.random() * 0.2 - (success ? 0.1 : 0))
  );
  
  // Set new weights
  network.setWeights(newWeights);
  
  // Save training data for later analysis
  if (network.getId() && inputs.length > 0) {
    network.saveTrainingData(inputs, outputs, success);
  }
}

export const mutateNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.15  // Increased from 0.1 to promote more exploration
): void => {
  const weights = network.getWeights();
  
  const mutatedWeights = weights.map(weight => {
    // Apply mutation with probability mutationRate
    if (Math.random() < mutationRate) {
      // Mutation: either small adjustment or complete reset
      if (Math.random() < 0.8) {
        return weight + (Math.random() * 0.5 - 0.25); // Larger adjustment (was 0.4-0.2)
      } else {
        return Math.random() * 2 - 1; // Complete reset
      }
    }
    return weight;
  });
  
  network.setWeights(mutatedWeights);
}

export const cloneNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.15  // Increased from 0.1 to promote more exploration
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
