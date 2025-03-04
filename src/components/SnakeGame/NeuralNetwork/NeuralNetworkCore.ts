import { NeuralNetwork as INeuralNetwork } from "../types";
import { deserializeWeights, serializeWeights, generateRandomWeights } from "../NeuralNetworkMatrix";
import { applyLearning, cloneNetwork, mutateNetwork } from "./NeuralNetworkLearning";
import { ExperienceManager } from "./core/NeuralNetworkExperience";
import { NetworkStats } from "./core/NeuralNetworkStats";
import { Predictor } from "./core/NeuralNetworkPrediction";
import { NetworkPersistence } from "./core/NeuralNetworkPersistence";

export class NeuralNetworkCore implements INeuralNetwork {
  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
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
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    const initialWeights = generateRandomWeights(inputSize, hiddenSize, outputSize);
    this.predictor = new Predictor(
      inputSize, 
      hiddenSize, 
      outputSize, 
      initialWeights.weightsInputHidden, 
      initialWeights.weightsHiddenOutput
    );
    
    if (weights && weights.length === (inputSize * hiddenSize + hiddenSize * outputSize)) {
      const deserialized = deserializeWeights(weights, inputSize, hiddenSize, outputSize);
      this.predictor.setWeights(deserialized.weightsInputHidden, deserialized.weightsHiddenOutput);
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

  serializeWeights(): number[] {
    return serializeWeights(
      this.predictor.getWeightsInputHidden(), 
      this.predictor.getWeightsHiddenOutput()
    );
  }
  
  deserializeWeights(flat: number[]): void {
    const deserialized = deserializeWeights(flat, this.inputSize, this.hiddenSize, this.outputSize);
    this.predictor.setWeights(deserialized.weightsInputHidden, deserialized.weightsHiddenOutput);
  }

  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1): void {
    this.trackLearningAttempt(success);
    
    if (inputs.length > 0 && outputs.length > 0) {
      this.experiences.addExperience([...inputs], [...outputs], success, reward);
    }
    
    applyLearning(this, success, inputs, outputs, reward);
    
    const replayThreshold = success ? 0.5 : 0.3;
    if (Math.random() < replayThreshold || reward > 1.5) {
      this.experiences.replayExperiences(5, (exp_success, exp_inputs, exp_outputs, exp_reward) => {
        applyLearning(this, exp_success, exp_inputs, exp_outputs, exp_reward);
      });
    }
  }

  clone(mutationRate: number = 0.1): INeuralNetwork {
    return cloneNetwork(this, mutationRate);
  }

  mutate(mutationRate: number = 0.1): void {
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
}
