
import { NeuralNetwork as INeuralNetwork } from "../types";
import { sigmoid } from "../NeuralNetworkActivations";
import { deserializeWeights, serializeWeights, generateRandomWeights } from "../NeuralNetworkMatrix";
import { 
  fetchBestModelFromDb, 
  saveModelToDb, 
  saveTrainingDataToDb
} from "../database/neuralNetworkDb";
import { applyLearning, cloneNetwork, mutateNetwork } from "./NeuralNetworkLearning";

export class NeuralNetworkCore implements INeuralNetwork {
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
    id?: string | null, 
    score?: number, 
    generation?: number,
    bestScore?: number,
    gamesPlayed?: number
  ) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Initialize weights matrices
    const initialWeights = generateRandomWeights(inputSize, hiddenSize, outputSize);
    this.weightsInputHidden = initialWeights.weightsInputHidden;
    this.weightsHiddenOutput = initialWeights.weightsHiddenOutput;
    
    // If weights are provided, deserialize them
    if (weights && weights.length === (inputSize * hiddenSize + hiddenSize * outputSize)) {
      const deserialized = deserializeWeights(weights, inputSize, hiddenSize, outputSize);
      this.weightsInputHidden = deserialized.weightsInputHidden;
      this.weightsHiddenOutput = deserialized.weightsHiddenOutput;
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

  // Forward pass through the network
  predict(inputs: number[]): number[] {
    // Adjust inputs to match expected input size
    // If we have more inputs than expected, truncate
    if (inputs.length > this.inputSize) {
      console.log(`Truncating inputs from ${inputs.length} to ${this.inputSize}`);
      inputs = inputs.slice(0, this.inputSize);
    } 
    // If we have fewer inputs than expected, pad with zeros
    else if (inputs.length < this.inputSize) {
      console.error(`Expected ${this.inputSize} inputs, got ${inputs.length}. Padding with zeros.`);
      inputs = [...inputs, ...Array(this.inputSize - inputs.length).fill(0)];
    }
    
    // Calculate hidden layer activations
    const hiddenOutputs = this.weightsInputHidden.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.inputSize; i++) {
        sum += weights[i] * inputs[i];
      }
      return sigmoid(sum);
    });
    
    // Calculate output layer activations
    const outputs = this.weightsHiddenOutput.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += weights[i] * hiddenOutputs[i];
      }
      return sigmoid(sum);
    });
    
    return outputs;
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

  // Method to save the model to database
  async save(score: number): Promise<string | null> {
    this.score = score;
    this.updateBestScore(score);
    
    // Create metadata for storing additional fields
    const metadata = {
      best_score: this.bestScore,
      games_played: this.gamesPlayed
    };
    
    const id = await saveModelToDb(this.id, this.getWeights(), score, this.generation, metadata);
    if (id) this.id = id;
    return id;
  }

  // Method to save training data
  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    if (!this.id) return;
    await saveTrainingDataToDb(this.id, inputs, outputs, success);
  }

  // Serialize weights to a flat array for storage
  serializeWeights(): number[] {
    return serializeWeights(this.weightsInputHidden, this.weightsHiddenOutput);
  }
  
  // Deserialize weights from a flat array
  deserializeWeights(flat: number[]): void {
    const deserialized = deserializeWeights(flat, this.inputSize, this.hiddenSize, this.outputSize);
    this.weightsInputHidden = deserialized.weightsInputHidden;
    this.weightsHiddenOutput = deserialized.weightsHiddenOutput;
  }

  // Implementing the required methods from INeuralNetwork interface
  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1): void {
    applyLearning(this, success, inputs, outputs, reward);
  }

  clone(mutationRate: number = 0.1): INeuralNetwork {
    return cloneNetwork(this, mutationRate);
  }

  mutate(mutationRate: number = 0.1): void {
    mutateNetwork(this, mutationRate);
  }
}
