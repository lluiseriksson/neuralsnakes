
import { saveModel, saveTrainingData, fetchBestModel, fetchAllModels, combineModels } from "./neuralNetworkStorage";

export class NeuralNetwork {
  private weights: number[];
  private id: string | null = null;
  private score: number = 0;
  private generation: number = 1;
  
  constructor(
    inputSize: number, 
    hiddenSize: number, 
    outputSize: number, 
    weights?: number[], 
    id?: string, 
    score?: number, 
    generation?: number
  ) {
    // Initialize weights with random values between -1 and 1 or use provided weights
    this.weights = weights || Array.from(
      { length: inputSize * hiddenSize + hiddenSize * outputSize }, 
      () => Math.random() * 2 - 1
    );
    
    // If an ID is provided, this is an existing model
    if (id) {
      this.id = id;
      this.score = score || 0;
      this.generation = generation || 1;
    }
  }

  predict(inputs: number[]): number[] {
    // Return 4 values for the 4 possible directions
    return [
      Math.random() + (inputs[0] * this.weights[0]),
      Math.random() + (inputs[1] * this.weights[1]),
      Math.random() + (inputs[2] * this.weights[2]),
      Math.random() + (inputs[3] * this.weights[3])
    ];
  }

  // Method to adjust weights based on success
  learn(success: boolean) {
    if (success) {
      // If successful, reinforce current weights
      this.weights = this.weights.map(w => w * 1.1);
    } else {
      // If unsuccessful, reduce weights
      this.weights = this.weights.map(w => w * 0.9);
    }
  }

  // Method to clone the network
  clone(): NeuralNetwork {
    const clone = new NeuralNetwork(8, 12, 4, [...this.weights], this.id, this.score, this.generation);
    return clone;
  }

  // Method to get the weights
  getWeights(): number[] {
    return this.weights;
  }

  // Method to set the weights
  setWeights(weights: number[]): void {
    this.weights = weights;
  }
  
  // Method to get the id
  getId(): string | null {
    return this.id;
  }
  
  // Method to get the generation
  getGeneration(): number {
    return this.generation;
  }

  // Method to save the model to Supabase
  async save(score: number): Promise<string | null> {
    this.score = score;
    const id = await saveModel(this, score);
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
          model.generation
        );
      });
    } catch (err) {
      console.error('Exception loading all neural networks:', err);
      return [];
    }
  }
}
