
import { BaseNeuralNetwork } from "./BaseNeuralNetwork";
import { NeuralNetwork as INeuralNetwork } from "../../types";
import { generateRandomWeights } from "../../NeuralNetworkMatrix";
import { Predictor } from "./NeuralNetworkPrediction";
import { NetworkPersistence } from "./NeuralNetworkPersistence";
import { NetworkStats } from "./NeuralNetworkStats";
import { ExperienceManager } from "./NeuralNetworkExperience";

export class NeuralNetworkCoreImpl extends BaseNeuralNetwork implements INeuralNetwork {
  private predictor: Predictor;
  private persistence: NetworkPersistence;
  private stats: NetworkStats;
  private experiences: ExperienceManager;

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
    super(inputSize, hiddenSize, outputSize);
    
    const initialWeights = generateRandomWeights(inputSize, hiddenSize, outputSize);
    this.predictor = new Predictor(
      inputSize, 
      hiddenSize, 
      outputSize, 
      initialWeights.weightsInputHidden, 
      initialWeights.weightsHiddenOutput
    );
    
    // Update the weights array with actual weights
    this.weights = [
      this.predictor.getWeightsInputHidden(),
      this.predictor.getWeightsHiddenOutput()
    ];
    
    // Initialize bias with empty arrays (as they're managed internally by predictor)
    this.bias = [Array(hiddenSize).fill(0), Array(outputSize).fill(0)];
    
    if (weights && weights.length === (inputSize * hiddenSize + hiddenSize * outputSize)) {
      this.deserializeWeights(weights);
    }
    
    this.persistence = new NetworkPersistence(id);
    this.stats = new NetworkStats(score, generation, bestScore, gamesPlayed);
    this.experiences = new ExperienceManager();
  }

  predict(inputs: number[]): number[] {
    const outputs = this.predictor.predict(inputs, this.stats.getGeneration());
    this.stats.setLastPredictions(outputs);
    return outputs;
  }

  getWeights(): number[] {
    return this.serializeWeights();
  }

  setWeights(weights: number[]): void {
    this.deserializeWeights(weights);
  }
  
  getId(): string | null {
    return this.persistence.getId();
  }
  
  getGeneration(): number {
    return this.stats.getGeneration();
  }
  
  updateGeneration(generation: number): void {
    this.stats.updateGeneration(generation);
  }
  
  getBestScore(): number {
    return this.stats.getBestScore();
  }
  
  getGamesPlayed(): number {
    return this.stats.getGamesPlayed();
  }
  
  setGamesPlayed(count: number): void {
    this.stats.setGamesPlayed(count);
  }
  
  updateBestScore(score: number): void {
    this.stats.updateBestScore(score);
  }

  getProgressPercentage(): number {
    return this.stats.getProgressPercentage();
  }

  async save(score: number): Promise<string | null> {
    this.stats.setScore(score);
    this.stats.updateBestScore(score);
    
    const performanceStats = {
      ...this.stats.getPerformanceStats(),
      learningRate: this.stats.getLearningRate()
    };
    
    return await this.persistence.save(
      this.getWeights(),
      score,
      this.stats.getGeneration(),
      this.stats.getBestScore(),
      this.stats.getGamesPlayed(),
      performanceStats
    );
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    await this.persistence.saveTrainingData(inputs, outputs, success);
  }

  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1): void {
    this.trackLearningAttempt(success);
    
    if (inputs.length > 0 && outputs.length > 0) {
      this.experiences.addExperience([...inputs], [...outputs], success, reward);
    }
    
    this.applyLearning(success, inputs, outputs, reward);
    
    const replayThreshold = success ? 0.5 : 0.3;
    if (Math.random() < replayThreshold || reward > 1.5) {
      this.replayExperiences();
    }
  }

  private applyLearning(success: boolean, inputs: number[], outputs: number[], reward: number): void {
    // Import and call the learning function to maintain the same behavior
    const { applyLearning } = require("../NeuralNetworkLearning");
    applyLearning(this, success, inputs, outputs, reward);
  }

  private replayExperiences(): void {
    this.experiences.replayExperiences(5, (exp_success, exp_inputs, exp_outputs, exp_reward) => {
      this.applyLearning(exp_success, exp_inputs, exp_outputs, exp_reward);
    });
  }

  clone(mutationRate: number = 0.1): INeuralNetwork {
    // Import and call the clone function to maintain the same behavior
    const { cloneNetwork } = require("../NeuralNetworkLearning");
    return cloneNetwork(this, mutationRate);
  }

  mutate(mutationRate: number = 0.1): void {
    // Import and call the mutate function to maintain the same behavior
    const { mutateNetwork } = require("../NeuralNetworkLearning");
    mutateNetwork(this, mutationRate);
  }

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    return this.stats.getPerformanceStats();
  }

  trackLearningAttempt(success: boolean): void {
    this.stats.trackLearningAttempt(success);
  }

  setScore(score: number): void {
    this.stats.setScore(score);
  }
  
  getWeightsInputHidden(): number[][] {
    return this.predictor.getWeightsInputHidden();
  }
  
  getWeightsHiddenOutput(): number[][] {
    return this.predictor.getWeightsHiddenOutput();
  }

  setInternalWeights(weightsInputHidden: number[][], weightsHiddenOutput: number[][]): void {
    this.predictor.setWeights(weightsInputHidden, weightsHiddenOutput);
    
    // Update the interface properties
    this.weights = [
      weightsInputHidden,
      weightsHiddenOutput
    ];
  }
}
