
export class NeuralNetwork {
  private directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[];

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  }

  predict(inputs: number[]): number[] {
    // Simplemente retorna probabilidades aleatorias para cada dirección
    return this.directions.map(() => Math.random());
  }
}
