
import { NeuralNetwork as INeuralNetwork } from "../../types";
import { deserializeWeights, serializeWeights } from "../../NeuralNetworkMatrix";

export abstract class BaseNeuralNetwork implements Partial<INeuralNetwork> {
  // Required interface properties
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weights: number[][][];
  bias: number[][];
  
  protected inputSize: number;
  protected hiddenSize: number;
  protected outputSize: number;
  
  constructor(
    inputSize: number, 
    hiddenSize: number, 
    outputSize: number
  ) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Initialize interface required properties
    this.inputNodes = inputSize;
    this.hiddenNodes = hiddenSize;
    this.outputNodes = outputSize;
    this.weights = []; // Will be populated in child classes
    this.bias = []; // Placeholder for bias
  }
  
  abstract predict(inputs: number[]): number[];
  abstract getWeights(): number[];
  abstract setWeights(weights: number[]): void;
  
  serializeWeights(): number[] {
    return serializeWeights(
      this.getWeightsInputHidden(),
      this.getWeightsHiddenOutput()
    );
  }
  
  deserializeWeights(flat: number[]): void {
    const deserialized = deserializeWeights(flat, this.inputSize, this.hiddenSize, this.outputSize);
    this.setInternalWeights(deserialized.weightsInputHidden, deserialized.weightsHiddenOutput);
    
    // Update the interface properties
    this.weights = [
      deserialized.weightsInputHidden,
      deserialized.weightsHiddenOutput
    ];
  }
  
  abstract getWeightsInputHidden(): number[][];
  abstract getWeightsHiddenOutput(): number[][];
  abstract setInternalWeights(weightsInputHidden: number[][], weightsHiddenOutput: number[][]): void;
}
