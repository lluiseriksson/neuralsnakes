
import { NeuralNetworkCore } from "./NeuralNetworkCore";

export const applyLearning = (
  network: NeuralNetworkCore,
  success: boolean, 
  inputs: number[] = [], 
  outputs: number[] = [], 
  reward: number = 1
): void => {
  // Skip learning if we don't have inputs (no context for learning)
  if (inputs.length === 0) {
    console.log("Skipping learning: no inputs provided");
    return;
  }
  
  // Track learning attempt
  network.trackLearningAttempt(success);
  
  // Calculate learning rate based on context
  // MUCHO más agresivo: aprendizaje muy amplificado
  const learningRate = success 
    ? 0.3 * Math.min(reward, 3.0) // Cap at 0.9 for success (mucho más alto)
    : 0.4 * Math.min(reward, 2.5); // Cap at 1.0 for failure (mucho más alto)
  
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
      // Mucho más fuerte para entradas significativas
      const inputStrength = Math.abs(inputValue) > 0.5 ? 2.0 : 1.5;
      const adjustment = inputValue * learningRate * inputStrength * (success ? 1 : -1);
      
      // Para éxitos, reforzamos MUCHO MÁS los pesos asociados a la dirección elegida
      if (success && outputs.length > 0 && outputs[outputIndex] > 0.5) {
        return weight + (adjustment * 3.0); // 300% más de refuerzo para la acción elegida
      }
      
      return weight + adjustment;
    }
    
    // Para pesos no relacionados con entradas, hacer ajustes aleatorios más pequeños
    // Pero lo suficientemente significativos para explorar nuevas soluciones
    const randomFactor = (Math.random() * 0.2 - 0.1) * (success ? 1 : -1);
    return weight + (randomFactor * learningRate);
  });
  
  // Establecer nuevos pesos
  network.setWeights(newWeights);
  
  // Guardar datos de entrenamiento para análisis posterior
  if (network.getId() && inputs.length > 0) {
    network.saveTrainingData(inputs, outputs, success).catch(err => {
      console.log("Error saving training data, but continuing", err);
    });
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
      if (Math.random() < 0.8) { // Más probabilidad para ajustes medianos
        // Ajuste normal mediano - siguiendo una curva de campana para mutaciones más naturales
        const gaussianRandom = () => {
          let u = 0, v = 0;
          while(u === 0) u = Math.random(); 
          while(v === 0) v = Math.random();
          return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };
        
        // Ajustes mucho más grandes para una exploración más amplia
        return weight + gaussianRandom() * 0.8; 
      } else {
        // Reinicio completo (20% de las veces) - permite explorar soluciones completamente nuevas
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
  
  // IMPORTANT: Explicitly increment generation when cloning
  const nextGeneration = network.getGeneration() + 1;
  console.log(`Cloning network: incrementing generation from ${network.getGeneration()} to ${nextGeneration}`);
  
  const clone = new NeuralNetworkCore(
    inputSize, 
    hiddenSize, 
    outputSize, 
    weights,
    null, // New ID for clone
    0, // Reset score for new clone
    nextGeneration, // Increment generation
    network.getBestScore(),
    0 // Reset games played
  );
  
  // Aplicar mutaciones con probabilidad mutationRate
  if (mutationRate > 0) {
    mutateNetwork(clone, mutationRate);
  }
  
  return clone;
}
