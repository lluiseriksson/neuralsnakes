
import { NeuralNetworkCore } from "./NeuralNetworkCore";

export const applyLearning = (
  network: NeuralNetworkCore,
  success: boolean, 
  inputs: number[] = [], 
  outputs: number[] = [], 
  reward: number = 1
): void => {
  // Skip learning if we don't have inputs (no context for learning)
  if (inputs.length === 0) return;
  
  // Calculate learning rate based on context
  // Más agresivo: aumentamos el aprendizaje general
  const learningRate = success 
    ? 0.15 * Math.min(reward, 2.5) // Cap at 0.375 for success (más alto que antes)
    : 0.2 * Math.min(reward, 2.0); // Cap at 0.4 for failure (más alto que antes)
  
  // Get current weights
  const currentWeights = network.getWeights();
  
  // Apply adjustments to weights based on input values
  // This creates a correlation between input patterns and outcomes
  const newWeights = currentWeights.map((weight, index) => {
    // Solo ajustar pesos relacionados con entradas activas
    // Usando una conexión más directa entre entradas y salidas
    if (index < inputs.length * 4) { // Assuming 4 output neurons
      const inputIndex = Math.floor(index / 4);
      const outputIndex = index % 4;
      const inputValue = inputs[inputIndex];
      
      // Ajuste de peso proporcional al valor de entrada y resultado del aprendizaje
      // Más fuerte para entradas significativas (mayor valor absoluto)
      const inputStrength = Math.abs(inputValue) > 0.5 ? 1.5 : 1.0;
      const adjustment = inputValue * learningRate * inputStrength * (success ? 1 : -1);
      
      // Para éxitos, reforzamos más los pesos asociados a la dirección elegida
      if (success && outputs.length > 0 && outputs[outputIndex] > 0.5) {
        return weight + (adjustment * 1.5); // 50% más de refuerzo para la acción elegida
      }
      
      return weight + adjustment;
    }
    
    // Para pesos no relacionados con entradas, hacer ajustes aleatorios más pequeños
    // Pero lo suficientemente significativos para explorar nuevas soluciones
    const randomFactor = (Math.random() * 0.15 - 0.075) * (success ? 1 : -1);
    return weight + (randomFactor * learningRate);
  });
  
  // Establecer nuevos pesos
  network.setWeights(newWeights);
  
  // Guardar datos de entrenamiento para análisis posterior
  if (network.getId() && inputs.length > 0) {
    network.saveTrainingData(inputs, outputs, success);
  }
}

export const mutateNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.1
): void => {
  const weights = network.getWeights();
  
  const mutatedWeights = weights.map(weight => {
    // Aplicar mutación con probabilidad mutationRate
    if (Math.random() < mutationRate) {
      // Mutación: ya sea un pequeño ajuste o un reinicio completo
      if (Math.random() < 0.85) { // Más probabilidad para ajustes pequeños
        // Ajuste normal pequeño - siguiendo una curva de campana para mutaciones más naturales
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        // Ajustes más grandes para una exploración más amplia
        return weight + gaussianRandom() * 0.5; 
      } else {
        // Reinicio completo (rara vez) - permite explorar soluciones completamente nuevas
        return Math.random() * 2 - 1;
      }
    }
    return weight;
  });
  
  network.setWeights(mutatedWeights);
}

export const cloneNetwork = (
  network: NeuralNetworkCore, 
  mutationRate: number = 0.1
): NeuralNetworkCore => {
  const inputSize = 8; // Tamaño de entrada estándar
  const hiddenSize = 12; // Tamaño oculto estándar
  const outputSize = 4; // Tamaño de salida estándar
  
  const weights = network.getWeights();
  const clone = new NeuralNetworkCore(
    inputSize, 
    hiddenSize, 
    outputSize, 
    weights,
    network.getId(),
    network.getBestScore(),
    network.getGeneration() + 1,
    network.getBestScore(),
    0 // Restablecer juegos jugados
  );
  
  // Aplicar mutaciones con probabilidad mutationRate
  if (mutationRate > 0) {
    mutateNetwork(clone, mutationRate);
  }
  
  return clone;
}
