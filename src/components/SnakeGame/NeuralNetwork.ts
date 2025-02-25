
export class NeuralNetwork {
  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.weights = this.initializeWeights();
  }

  private initializeWeights() {
    // Inicializar pesos con valores aleatorios más grandes para decisiones más definidas
    const weights = [];
    for (let i = 0; i < this.outputSize; i++) {
      const layerWeights = [];
      for (let j = 0; j < this.inputSize; j++) {
        layerWeights.push((Math.random() * 4 - 2)); // Valores entre -2 y 2
      }
      weights.push(layerWeights);
    }
    return weights;
  }

  predict(inputs: number[]): number[] {
    // Implementación simple pero efectiva de feedforward
    const outputs = this.weights.map(neuronWeights => {
      let sum = 0;
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * neuronWeights[i];
      }
      return sum; // Sin ReLU para mantener valores negativos
    });

    // Softmax para normalizar las salidas
    const maxOutput = Math.max(...outputs);
    const expOutputs = outputs.map(x => Math.exp(x - maxOutput)); // Restamos el máximo para estabilidad numérica
    const sumExp = expOutputs.reduce((a, b) => a + b, 0);
    return expOutputs.map(x => x / sumExp);
  }

  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private weights: number[][];
}
