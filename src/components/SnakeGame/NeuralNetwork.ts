
import { saveModel, saveTrainingData, fetchBestModel, fetchAllModels, combineModels } from "./neuralNetworkStorage";

export class NeuralNetwork {
  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private weightsInputHidden: number[][];
  private weightsHiddenOutput: number[][];
  private id: string | null = null;
  private score: number = 0;
  private generation: number = 1;
  private bestScore: number = 0;
  private gamesPlayed: number = 0;
  
  constructor(
    inputSize: number, 
    hiddenSize: number, 
    outputSize: number, 
    weights?: number[], 
    id?: string, 
    score?: number, 
    generation?: number,
    bestScore?: number,
    gamesPlayed?: number
  ) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Initialize weights matrices
    this.weightsInputHidden = Array(hiddenSize).fill(0).map(() => 
      Array(inputSize).fill(0).map(() => Math.random() * 2 - 1)
    );
    
    this.weightsHiddenOutput = Array(outputSize).fill(0).map(() => 
      Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1)
    );
    
    // If weights are provided, deserialize them
    if (weights && weights.length === (inputSize * hiddenSize + hiddenSize * outputSize)) {
      this.deserializeWeights(weights);
    }
    
    // If an ID is provided, this is an existing model
    if (id) {
      this.id = id;
      this.score = score || 0;
      this.generation = generation || 1;
      this.bestScore = bestScore || 0;
      this.gamesPlayed = gamesPlayed || 0;
    }
  }

  // Sigmoid activation function
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Forward pass through the network
  predict(inputs: number[]): number[] {
    if (inputs.length !== this.inputSize) {
      console.error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
      // Pad or truncate inputs if necessary
      inputs = inputs.slice(0, this.inputSize).concat(Array(Math.max(0, this.inputSize - inputs.length)).fill(0));
    }
    
    // Calculate hidden layer activations
    const hiddenOutputs = this.weightsInputHidden.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.inputSize; i++) {
        sum += weights[i] * inputs[i];
      }
      return this.sigmoid(sum);
    });
    
    // Calculate output layer activations
    const outputs = this.weightsHiddenOutput.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += weights[i] * hiddenOutputs[i];
      }
      return this.sigmoid(sum);
    });
    
    return outputs;
  }

  // Method to adjust weights based on success
  learn(success: boolean, inputs: number[], outputs: number[], reward: number = 1) {
    this.gamesPlayed++;
    
    // Higher reward for better performance
    const learningRate = success ? 0.1 * reward : 0.05;
    
    // Small random adjustments based on current game results
    this.weightsInputHidden = this.weightsInputHidden.map(row => 
      row.map(weight => weight + (success ? 1 : -1) * learningRate * (Math.random() * 0.2 - 0.1))
    );
    
    this.weightsHiddenOutput = this.weightsHiddenOutput.map(row => 
      row.map(weight => weight + (success ? 1 : -1) * learningRate * (Math.random() * 0.2 - 0.1))
    );
    
    // Save training data for later analysis
    if (this.id) {
      this.saveTrainingData(inputs, outputs, success);
    }
  }

  // Method to clone the network with possible mutations
  clone(mutationRate: number = 0.1): NeuralNetwork {
    const weights = this.serializeWeights();
    const clone = new NeuralNetwork(
      this.inputSize, 
      this.hiddenSize, 
      this.outputSize, 
      weights,
      this.id,
      this.score,
      this.generation + 1,
      this.bestScore,
      0 // Reset games played
    );
    
    // Apply mutations with probability mutationRate
    if (mutationRate > 0) {
      clone.mutate(mutationRate);
    }
    
    return clone;
  }
  
  // Apply mutations to the network
  mutate(mutationRate: number = 0.1): void {
    this.weightsInputHidden = this.weightsInputHidden.map(row => 
      row.map(weight => {
        // Apply mutation with probability mutationRate
        if (Math.random() < mutationRate) {
          // Mutation: either small adjustment or complete reset
          if (Math.random() < 0.8) {
            return weight + (Math.random() * 0.4 - 0.2); // Small adjustment
          } else {
            return Math.random() * 2 - 1; // Complete reset
          }
        }
        return weight;
      })
    );
    
    this.weightsHiddenOutput = this.weightsHiddenOutput.map(row => 
      row.map(weight => {
        if (Math.random() < mutationRate) {
          if (Math.random() < 0.8) {
            return weight + (Math.random() * 0.4 - 0.2);
          } else {
            return Math.random() * 2 - 1;
          }
        }
        return weight;
      })
    );
  }

  // Serialize weights to a flat array for storage
  serializeWeights(): number[] {
    const flat: number[] = [];
    
    // Flatten input-hidden weights
    this.weightsInputHidden.forEach(row => {
      row.forEach(weight => flat.push(weight));
    });
    
    // Flatten hidden-output weights
    this.weightsHiddenOutput.forEach(row => {
      row.forEach(weight => flat.push(weight));
    });
    
    return flat;
  }
  
  // Deserialize weights from a flat array
  deserializeWeights(flat: number[]): void {
    let index = 0;
    
    // Deserialize input-hidden weights
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        if (index < flat.length) {
          this.weightsInputHidden[i][j] = flat[index++];
        }
      }
    }
    
    // Deserialize hidden-output weights
    for (let i = 0; i < this.outputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        if (index < flat.length) {
          this.weightsHiddenOutput[i][j] = flat[index++];
        }
      }
    }
  }

  // Method to get the weights for storage
  getWeights(): number[] {
    return this.serializeWeights();
  }

  // Method to set the weights
  setWeights(weights: number[]): void {
    this.deserializeWeights(weights);
  }
  
  // Method to get the id
  getId(): string | null {
    return this.id;
  }
  
  // Method to get the generation
  getGeneration(): number {
    return this.generation;
  }
  
  // Method to get the best score
  getBestScore(): number {
    return this.bestScore;
  }
  
  // Method to get games played
  getGamesPlayed(): number {
    return this.gamesPlayed;
  }
  
  // Method to update the best score
  updateBestScore(score: number): void {
    if (score > this.bestScore) {
      this.bestScore = score;
    }
  }

  // Method to calculate progress percentage
  getProgressPercentage(): number {
    // Using an asymptotic function that approaches 100% as bestScore increases
    // We consider 50 points as approximately 90% of theoretical "perfect" potential
    const perfectScore = 50;
    return Math.min(100, (this.bestScore / perfectScore) * 100);
  }

  // Method to save the model to Supabase
  async save(score: number): Promise<string | null> {
    this.score = score;
    this.updateBestScore(score);
    
    const id = await saveModel(this, score, this.bestScore, this.gamesPlayed);
    if (id) this.id = id;
    return id;
  }

  // Method to save training data
  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    await saveTrainingData(this.id, inputs, outputs, success);
  }

  // Static methods
  static async loadBest(): Promise<NeuralNetwork | null> {
    return fetchBestModel();
  }

  static async combineModels(count: number = 5): Promise<NeuralNetwork | null> {
    return combineModels(count);
  }

  static async getAllModels(): Promise<NeuralNetwork[]> {
    try {
      const data = await fetchAllModels();
      
      return data.map(model => {
        // Ensure weights is treated as number[]
        const weightsArray = model.weights as unknown as number[];
        
        return new NeuralNetwork(
          8, 
          12, 
          4, 
          weightsArray, 
          model.id, 
          model.score, 
          model.generation,
          model.best_score,
          model.games_played
        );
      });
    } catch (err) {
      console.error('Exception loading all neural networks:', err);
      return [];
    }
  }
}
