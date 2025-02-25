
export class NeuralNetwork {
  private weights: number[];
  private readonly inputSize: number;
  private readonly hiddenSize: number;
  private readonly outputSize: number;
  
  constructor(inputSize: number = 16, hiddenSize: number = 12, outputSize: number = 4) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    
    // Inicializar pesos para dos capas (input->hidden y hidden->output)
    const totalWeights = (inputSize * hiddenSize) + (hiddenSize * outputSize);
    this.weights = Array.from({ length: totalWeights }, 
      () => Math.random() * 2 - 1
    );
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  predict(inputs: number[]): number[] {
    if (inputs.length !== this.inputSize) {
      throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
    }

    // Primera capa: input -> hidden
    const hidden = Array(this.hiddenSize).fill(0);
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = 0;
      for (let j = 0; j < this.inputSize; j++) {
        sum += inputs[j] * this.weights[i * this.inputSize + j];
      }
      hidden[i] = this.sigmoid(sum);
    }

    // Segunda capa: hidden -> output
    const offset = this.inputSize * this.hiddenSize;
    const output = Array(this.outputSize).fill(0);
    for (let i = 0; i < this.outputSize; i++) {
      let sum = 0;
      for (let j = 0; j < this.hiddenSize; j++) {
        sum += hidden[j] * this.weights[offset + i * this.hiddenSize + j];
      }
      output[i] = this.sigmoid(sum);
    }

    return output;
  }

  learn(success: boolean) {
    if (success) {
      // Si fue exitoso, reforzamos los pesos actuales
      this.weights = this.weights.map(w => w * 1.1);
    } else {
      // Si no fue exitoso, reducimos los pesos
      this.weights = this.weights.map(w => w * 0.9);
    }
  }

  clone(): NeuralNetwork {
    const clone = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
    clone.weights = [...this.weights];
    return clone;
  }
}
