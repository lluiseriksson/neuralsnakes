import { NeuralNetwork as INeuralNetwork } from "../types";
import { sigmoid } from "../NeuralNetworkActivations";
import { deserializeWeights, serializeWeights, generateRandomWeights } from "../NeuralNetworkMatrix";
import { 
  fetchBestModelFromDb, 
  saveModelToDb, 
  saveTrainingDataToDb
} from "../database/neuralNetworkDb";
import { applyLearning, cloneNetwork, mutateNetwork } from "./NeuralNetworkLearning";

type Experience = {
  inputs: number[];
  outputs: number[];
  success: boolean;
  reward: number;
  timestamp: number;
};

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
  private learningAttempts: number = 0;
  private successfulMoves: number = 0;
  private failedMoves: number = 0;
  private experiences: Experience[] = [];
  private maxExperiences: number = 100;
  private learningRate: number = 0.3;
  private lastPredictions: number[] = [];

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
    this.weightsInputHidden = initialWeights.weightsInputHidden;
    this.weightsHiddenOutput = initialWeights.weightsHiddenOutput;
    
    if (weights && weights.length === (inputSize * hiddenSize + hiddenSize * outputSize)) {
      const deserialized = deserializeWeights(weights, inputSize, hiddenSize, outputSize);
      this.weightsInputHidden = deserialized.weightsInputHidden;
      this.weightsHiddenOutput = deserialized.weightsHiddenOutput;
    }
    
    if (id) {
      this.id = id;
      this.score = score || 0;
      this.generation = generation || 1;
      this.bestScore = bestScore || 0;
      this.gamesPlayed = gamesPlayed || 0;
    }
    
    if (generation && generation > 50) {
      this.learningRate = Math.max(0.05, 0.3 - (generation / 1000));
      console.log(`Network ${id || 'new'} (gen ${generation}) using adaptive learning rate: ${this.learningRate.toFixed(4)}`);
    }
  }

  predict(inputs: number[]): number[] {
    if (inputs.length > this.inputSize) {
      console.log(`Truncating inputs from ${inputs.length} to ${this.inputSize}`);
      inputs = inputs.slice(0, this.inputSize);
    } 
    else if (inputs.length < this.inputSize) {
      console.error(`Expected ${this.inputSize} inputs, got ${inputs.length}. Padding with zeros.`);
      inputs = [...inputs, ...Array(this.inputSize - inputs.length).fill(0)];
    }
    
    const addNoise = this.generation < 50;
    const noiseLevel = Math.max(0, 0.1 - (this.generation / 500));
    
    const hiddenOutputs = this.weightsInputHidden.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.inputSize; i++) {
        sum += weights[i] * inputs[i];
      }
      
      if (addNoise) {
        sum += (Math.random() * 2 - 1) * noiseLevel;
      }
      
      return sigmoid(sum);
    });
    
    const outputs = this.weightsHiddenOutput.map(weights => {
      let sum = 0;
      for (let i = 0; i < this.hiddenSize; i++) {
        sum += weights[i] * hiddenOutputs[i];
      }
      
      if (addNoise) {
        sum += (Math.random() * 2 - 1) * noiseLevel;
      }
      
      return sigmoid(sum);
    });
    
    this.lastPredictions = [...outputs];
    
    return outputs;
  }

  getWeights(): number[] {
    return this.serializeWeights();
  }

  setWeights(weights: number[]): void {
    this.deserializeWeights(weights);
  }
  
  getId(): string | null {
    return this.id;
  }
  
  getGeneration(): number {
    return this.generation;
  }
  
  updateGeneration(generation: number): void {
    this.generation = generation;
    
    this.learningRate = Math.max(0.05, 0.3 - (generation / 1000));
  }
  
  getBestScore(): number {
    return this.bestScore;
  }
  
  getGamesPlayed(): number {
    return this.gamesPlayed;
  }
  
  setGamesPlayed(count: number): void {
    this.gamesPlayed = count;
  }
  
  updateBestScore(score: number): void {
    if (score > this.bestScore) {
      this.bestScore = score;
    }
  }

  getProgressPercentage(): number {
    const perfectScore = 50;
    return Math.min(100, (this.bestScore / perfectScore) * 100);
  }

  async save(score: number): Promise<string | null> {
    this.score = score;
    this.updateBestScore(score);
    
    const metadata = {
      best_score: this.bestScore,
      games_played: this.gamesPlayed,
      performance: {
        learningAttempts: this.learningAttempts,
        successfulMoves: this.successfulMoves,
        failedMoves: this.failedMoves,
        learningRate: this.learningRate
      }
    };
    
    const id = await saveModelToDb(this.id, this.getWeights(), score, this.generation, metadata);
    if (id) this.id = id;
    return id;
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    if (!this.id) return;
    await saveTrainingDataToDb(this.id, inputs, outputs, success);
  }

  serializeWeights(): number[] {
    return serializeWeights(this.weightsInputHidden, this.weightsHiddenOutput);
  }
  
  deserializeWeights(flat: number[]): void {
    const deserialized = deserializeWeights(flat, this.inputSize, this.hiddenSize, this.outputSize);
    this.weightsInputHidden = deserialized.weightsInputHidden;
    this.weightsHiddenOutput = deserialized.weightsHiddenOutput;
  }

  private addExperience(inputs: number[], outputs: number[], success: boolean, reward: number): void {
    this.experiences.push({ 
      inputs, 
      outputs, 
      success, 
      reward,
      timestamp: Date.now()
    });
    
    if (this.experiences.length > this.maxExperiences) {
      this.experiences.shift();
    }
  }
  
  private replayExperiences(count: number = 5): void {
    if (this.experiences.length < 10) return;
    
    const prioritizedExperiences = [...this.experiences].sort((a, b) => {
      const recencyScoreA = (Date.now() - a.timestamp) / 60000;
      const recencyScoreB = (Date.now() - b.timestamp) / 60000;
      
      const priorityA = a.reward - (recencyScoreA * 0.1);
      const priorityB = b.reward - (recencyScoreB * 0.1);
      
      return priorityB - priorityA;
    });
    
    for (let i = 0; i < Math.min(count, prioritizedExperiences.length); i++) {
      const exp = prioritizedExperiences[i];
      
      const ageInMinutes = (Date.now() - exp.timestamp) / 60000;
      const recencyFactor = Math.max(0.5, 1 - (ageInMinutes / 30));
      
      applyLearning(this, exp.success, exp.inputs, exp.outputs, exp.reward * recencyFactor);
    }
  }

  learn(success: boolean, inputs: number[] = [], outputs: number[] = [], reward: number = 1): void {
    this.trackLearningAttempt(success);
    
    if (inputs.length > 0 && outputs.length > 0) {
      this.addExperience([...inputs], [...outputs], success, reward);
    }
    
    applyLearning(this, success, inputs, outputs, reward);
    
    const replayThreshold = success ? 0.5 : 0.3;
    if (Math.random() < replayThreshold || reward > 1.5) {
      this.replayExperiences();
    }
  }

  clone(mutationRate: number = 0.1): INeuralNetwork {
    return cloneNetwork(this, mutationRate);
  }

  mutate(mutationRate: number = 0.1): void {
    mutateNetwork(this, mutationRate);
  }

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    return {
      learningAttempts: this.learningAttempts,
      successfulMoves: this.successfulMoves,
      failedMoves: this.failedMoves
    };
  }

  trackLearningAttempt(success: boolean): void {
    this.learningAttempts++;
    if (success) {
      this.successfulMoves++;
    } else {
      this.failedMoves++;
    }
  }
}
