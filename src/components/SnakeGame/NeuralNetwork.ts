
import { NeuralNetwork as INeuralNetwork } from "./types";
import { NeuralNetworkCore } from "./NeuralNetwork/NeuralNetworkCore";
import { applyLearning, cloneNetwork, mutateNetwork } from "./NeuralNetwork/NeuralNetworkLearning";
import { loadBestModel, loadAllModels, getCombinedModel } from "./NeuralNetwork/NeuralNetworkLoader";

export class NeuralNetwork implements INeuralNetwork {
  private core: NeuralNetworkCore;
  
  // Required properties from interface
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weights: number[][][];
  bias: number[][];
  
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
    
    // Initialize required interface properties
    this.inputNodes = inputSize;
    this.hiddenNodes = hiddenSize;
    this.outputNodes = outputSize;
    
    // Initialize weights and bias with empty arrays (they're managed by core)
    this.weights = [];
    this.bias = [];
    
    // Populate weights from core if available
    if (this.core.getWeightsInputHidden && this.core.getWeightsHiddenOutput) {
      this.syncWeightsFromCore();
    }
  }
  
  // Sync weights from core to interface properties
  private syncWeightsFromCore() {
    if (this.core.getWeightsInputHidden && this.core.getWeightsHiddenOutput) {
      this.weights = [
        this.core.getWeightsInputHidden(),
        this.core.getWeightsHiddenOutput()
      ];
      // Initialize bias with empty arrays (as they're managed internally by core)
      this.bias = [Array(this.hiddenNodes).fill(0), Array(this.outputNodes).fill(0)];
    }
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
      this.inputNodes, // Use stored input size
      this.hiddenNodes, // Use stored hidden size
      this.outputNodes, // Use stored output size
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
    this.syncWeightsFromCore(); // Keep interface properties in sync
  }

  // Weight management
  getWeights(): number[] {
    return this.core.getWeights();
  }

  setWeights(weights: number[]): void {
    this.core.setWeights(weights);
    this.syncWeightsFromCore(); // Keep interface properties in sync
  }
  
  // Core getters
  getId(): string | null {
    return this.core.getId();
  }
  
  getGeneration(): number {
    return this.core.getGeneration();
  }
  
  updateGeneration(generation: number): void {
    if (typeof generation !== 'number' || generation < 1) {
      console.error(`Invalid generation value: ${generation}, using 1 instead`);
      generation = 1;
    }
    // Use the core's updateGeneration method
    this.core.updateGeneration(generation);
    
    // Also update the model cache generation
    if (generation > 1) {
      try {
        const { updateCurrentGeneration } = require('./hooks/snakeCreation/modelCache');
        updateCurrentGeneration(generation);
        console.log(`Neural network updated to generation ${generation} and propagated to global cache`);
      } catch (err) {
        console.error("Error updating global generation:", err);
      }
    }
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

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    return this.core.getPerformanceStats();
  }

  // Database operations
  async save(score: number): Promise<string | null> {
    return this.core.save(score);
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    await this.core.saveTrainingData(inputs, outputs, success);
  }

  // Set score
  setScore(score: number): void {
    this.core.setScore(score);
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
