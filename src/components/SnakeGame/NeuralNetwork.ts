
export class NeuralNetwork {
  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.weights = this.initializeWeights();
  }

  private initializeWeights() {
    // Inicializar pesos con valores aleatorios entre -1 y 1
    const weights = [];
    for (let i = 0; i < this.outputSize; i++) {
      const layerWeights = [];
      for (let j = 0; j < this.inputSize; j++) {
        layerWeights.push((Math.random() * 2 - 1));
      }
      weights.push(layerWeights);
    }
    return weights;
  }

  predict(inputs: number[]): number[] {
    // Implementación simple de una red feedforward
    const outputs = this.weights.map(neuronWeights => {
      let sum = 0;
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * neuronWeights[i];
      }
      // Función de activación ReLU simple
      return Math.max(0, sum);
    });

    // Normalizar las salidas usando softmax
    const expOutputs = outputs.map(x => Math.exp(x));
    const sumExp = expOutputs.reduce((a, b) => a + b, 0);
    return expOutputs.map(x => x / sumExp);
  }

  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private weights: number[][];
}
