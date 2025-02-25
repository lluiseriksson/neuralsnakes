
export class NeuralNetwork {
  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.weights = this.initializeWeights();
  }

  private initializeWeights() {
    // Inicializar con valores más extremos para decisiones más claras
    const weights = [];
    for (let i = 0; i < this.outputSize; i++) {
      const layerWeights = [];
      for (let j = 0; j < this.inputSize; j++) {
        layerWeights.push(Math.random() < 0.5 ? -5 : 5); // Valores extremos para decisiones más claras
      }
      weights.push(layerWeights);
    }
    return weights;
  }

  predict(inputs: number[]): number[] {
    // Implementación directa sin capas ocultas
    const outputs = this.weights.map(neuronWeights => {
      let sum = 0;
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * neuronWeights[i];
      }
      return Math.tanh(sum); // Usar tanh para valores entre -1 y 1
    });

    // Convertir a probabilidades
    const expOutputs = outputs.map(x => Math.exp(x));
    const sumExp = expOutputs.reduce((a, b) => a + b, 0);
    return expOutputs.map(x => x / sumExp);
  }

  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private weights: number[][];
}
