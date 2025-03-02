
import { sigmoid } from "../NeuralNetworkActivations";

export class Predictor {
  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private weightsInputHidden: number[][];
  private weightsHiddenOutput: number[][];
  
  constructor(
    inputSize: number,
    hiddenSize: number,
    outputSize: number,
    weightsInputHidden: number[][],
    weightsHiddenOutput: number[][]
  ) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.weightsInputHidden = weightsInputHidden;
    this.weightsHiddenOutput = weightsHiddenOutput;
  }
  
  setWeights(weightsInputHidden: number[][], weightsHiddenOutput: number[][]): void {
    this.weightsInputHidden = weightsInputHidden;
    this.weightsHiddenOutput = weightsHiddenOutput;
  }
  
  getWeightsInputHidden(): number[][] {
    return this.weightsInputHidden;
  }
  
  getWeightsHiddenOutput(): number[][] {
    return this.weightsHiddenOutput;
  }
  
  predict(inputs: number[], generation: number): number[] {
    if (inputs.length > this.inputSize) {
      console.log(`Truncating inputs from ${inputs.length} to ${this.inputSize}`);
      inputs = inputs.slice(0, this.inputSize);
    } 
    else if (inputs.length < this.inputSize) {
      console.error(`Expected ${this.inputSize} inputs, got ${inputs.length}. Padding with zeros.`);
      inputs = [...inputs, ...Array(this.inputSize - inputs.length).fill(0)];
    }
    
    const addNoise = generation < 50;
    const noiseLevel = Math.max(0, 0.1 - (generation / 500));
    
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
    
    return outputs;
  }
}
