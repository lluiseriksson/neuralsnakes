
import { NeuralNetwork as INeuralNetwork } from "./types";
import { NeuralNetworkCore } from "./NeuralNetwork/NeuralNetworkCore";
import { applyLearning, cloneNetwork, mutateNetwork } from "./NeuralNetwork/NeuralNetworkLearning";
import { loadBestModel, loadAllModels, getCombinedModel } from "./NeuralNetwork/NeuralNetworkLoader";

export class NeuralNetwork implements INeuralNetwork {
  private core: NeuralNetworkCore;
  
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
    this.core = new NeuralNetworkCore(
      inputSize, 
      hiddenSize, 
      outputSize, 
      weights, 
      id, 
      score, 
      generation,
      bestScore,
      gamesPlayed
    );
  }

  // Forward prediction
  predict(inputs: number[]): number[] {
    return this.core.predict(inputs);
  }

  // Learning method
  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1) {
    applyLearning(this.core, success, inputs, outputs, reward);
  }

  // Cloning with possible mutations
  clone(mutationRate: number = 0.1): INeuralNetwork {
    const clonedCore = cloneNetwork(this.core, mutationRate);
    
    return new NeuralNetwork(
      8, // Standard input size 
      12, // Standard hidden size
      4, // Standard output size
      clonedCore.getWeights(),
      clonedCore.getId(),
      0, // Reset score
      clonedCore.getGeneration(),
      clonedCore.getBestScore(),
      0 // Reset games played
    );
  }
  
  // Apply mutations
  mutate(mutationRate: number = 0.1): void {
    mutateNetwork(this.core, mutationRate);
  }

  // Weight management
  getWeights(): number[] {
    return this.core.getWeights();
  }

  setWeights(weights: number[]): void {
    this.core.setWeights(weights);
  }
  
  // Core getters
  getId(): string | null {
    return this.core.getId();
  }
  
  getGeneration(): number {
    return this.core.getGeneration();
  }
  
  getBestScore(): number {
    return this.core.getBestScore();
  }
  
  getGamesPlayed(): number {
    return this.core.getGamesPlayed();
  }
  
  updateBestScore(score: number): void {
    this.core.updateBestScore(score);
  }

  getProgressPercentage(): number {
    return this.core.getProgressPercentage();
  }

  // Database operations
  async save(score: number): Promise<string | null> {
    return this.core.save(score);
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    await this.core.saveTrainingData(inputs, outputs, success);
  }

  // Static methods for model management
  static async loadBest(): Promise<INeuralNetwork | null> {
    return loadBestModel();
  }

  static async getAllModels(): Promise<INeuralNetwork[]> {
    return loadAllModels();
  }

  static async combineModels(count: number = 5): Promise<INeuralNetwork | null> {
    return getCombinedModel(count);
  }
}
