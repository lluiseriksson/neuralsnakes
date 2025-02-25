
export class NeuralNetwork {
  private weights: number[];
  
  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    // Inicializar pesos con valores aleatorios entre -1 y 1
    this.weights = Array.from({ length: inputSize * hiddenSize + hiddenSize * outputSize }, 
      () => Math.random() * 2 - 1
    );
  }

  predict(inputs: number[]): number[] {
    // Retorna 4 valores para las 4 posibles direcciones
    return [
      Math.random() + (inputs[0] * this.weights[0]),
      Math.random() + (inputs[1] * this.weights[1]),
      Math.random() + (inputs[2] * this.weights[2]),
      Math.random() + (inputs[3] * this.weights[3])
    ];
  }

  // Método para ajustar los pesos basado en el éxito
  learn(success: boolean) {
    if (success) {
      // Si fue exitoso, reforzamos los pesos actuales
      this.weights = this.weights.map(w => w * 1.1);
    } else {
      // Si no fue exitoso, reducimos los pesos
      this.weights = this.weights.map(w => w * 0.9);
    }
  }

  // Método para clonar la red
  clone(): NeuralNetwork {
    const clone = new NeuralNetwork(8, 12, 4);
    clone.weights = [...this.weights];
    return clone;
  }
}
