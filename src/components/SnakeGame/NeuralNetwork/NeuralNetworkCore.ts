
import { NeuralNetwork as INeuralNetwork } from "../types";
import { NeuralNetworkCoreImpl } from "./core/NeuralNetworkCoreImpl";

// Reexporting the implementation as NeuralNetworkCore for backwards compatibility
export class NeuralNetworkCore implements INeuralNetwork {
  private implementation: NeuralNetworkCoreImpl;
  
  // Required interface properties
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
    this.implementation = new NeuralNetworkCoreImpl(
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
    
    // Mirror the properties from the implementation
    this.inputNodes = this.implementation.inputNodes;
    this.hiddenNodes = this.implementation.hiddenNodes;
    this.outputNodes = this.implementation.outputNodes;
    this.weights = this.implementation.weights;
    this.bias = this.implementation.bias;
  }

  // Forward all method calls to the implementation
  predict(inputs: number[]): number[] {
    return this.implementation.predict(inputs);
  }

  getWeights(): number[] {
    return this.implementation.getWeights();
  }

  setWeights(weights: number[]): void {
    this.implementation.setWeights(weights);
    
    // Update the mirror properties
    this.weights = this.implementation.weights;
    this.bias = this.implementation.bias;
  }
  
  getId(): string | null {
    return this.implementation.getId();
  }
  
  getGeneration(): number {
    return this.implementation.getGeneration();
  }
  
  updateGeneration(generation: number): void {
    this.implementation.updateGeneration(generation);
  }
  
  getBestScore(): number {
    return this.implementation.getBestScore();
  }
  
  getGamesPlayed(): number {
    return this.implementation.getGamesPlayed();
  }
  
  setGamesPlayed(count: number): void {
    this.implementation.setGamesPlayed(count);
  }
  
  updateBestScore(score: number): void {
    this.implementation.updateBestScore(score);
  }

  getProgressPercentage(): number {
    return this.implementation.getProgressPercentage();
  }

  async save(score: number): Promise<string | null> {
    return this.implementation.save(score);
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    await this.implementation.saveTrainingData(inputs, outputs, success);
  }

  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1): void {
    this.implementation.learn(success, inputs, outputs, reward);
  }

  clone(mutationRate: number = 0.1): INeuralNetwork {
    return this.implementation.clone(mutationRate);
  }

  mutate(mutationRate: number = 0.1): void {
    this.implementation.mutate(mutationRate);
    
    // Update the mirror properties after mutation
    this.weights = this.implementation.weights;
    this.bias = this.implementation.bias;
  }

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    return this.implementation.getPerformanceStats();
  }

  trackLearningAttempt(success: boolean): void {
    this.implementation.trackLearningAttempt(success);
  }

  setScore(score: number): void {
    this.implementation.setScore(score);
  }
  
  // Additional methods for core functionality
  getWeightsInputHidden(): number[][] {
    return this.implementation.getWeightsInputHidden();
  }
  
  getWeightsHiddenOutput(): number[][] {
    return this.implementation.getWeightsHiddenOutput();
  }

  serializeWeights(): number[] {
    // Forward to the implementation if it has this method
    if ('serializeWeights' in this.implementation) {
      return (this.implementation as any).serializeWeights();
    }
    
    // Fallback implementation
    return this.getWeights();
  }
  
  deserializeWeights(flat: number[]): void {
    // Forward to the implementation if it has this method
    if ('deserializeWeights' in this.implementation) {
      (this.implementation as any).deserializeWeights(flat);
      
      // Update the mirror properties
      this.weights = this.implementation.weights;
      this.bias = this.implementation.bias;
      return;
    }
    
    // Fallback implementation
    this.setWeights(flat);
  }
}
