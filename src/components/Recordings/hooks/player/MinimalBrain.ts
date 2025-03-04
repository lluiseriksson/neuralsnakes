
import { NeuralNetwork } from "../../../SnakeGame/types";

/**
 * Implementation of a minimal brain for visualization in recordings
 * Provides the bare essentials required by the NeuralNetwork interface
 */
export class MinimalBrain implements NeuralNetwork {
  private generationValue: number = 0;
  private scoreValue: number = 0;
  
  constructor(generation: number = 0, score: number = 0) {
    this.generationValue = generation;
    this.scoreValue = score;
  }
  
  // Implement required methods
  predict(inputs: number[]): number[] { return [0, 0, 0, 0]; }
  learn(success: boolean, inputs?: number[], outputs?: number[], reward?: number): void {}
  clone(mutationRate?: number): NeuralNetwork { return new MinimalBrain(this.generationValue, this.scoreValue); }
  save(score?: number): Promise<string | null> { return Promise.resolve(null); }
  getId(): string | null { return null; }
  getWeights(): number[] { return []; }
  setWeights(weights: number[]): void {}
  getGeneration(): number { return this.generationValue; }
  updateGeneration(generation: number): void { this.generationValue = generation; }
  getBestScore(): number { return this.scoreValue; }
  getGamesPlayed(): number { return 1; }
  updateBestScore(score: number): void { this.scoreValue = score; }
  mutate(mutationRate?: number): void {}
  getProgressPercentage(): number { return 0; }
  saveTrainingData(): Promise<void> { return Promise.resolve(); }
  getPerformanceStats() { return { learningAttempts: 1, successfulMoves: 0, failedMoves: 0 }; }
  setScore(score: number): void { this.scoreValue = score; }
}
