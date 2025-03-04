
import { NeuralNetwork as INeuralNetwork } from '../../types';
import { NeuralNetwork } from '../../NeuralNetwork';
import { 
  getModelCache, 
  setBestModelCache, 
  setCombinedModelCache, 
  incrementGeneration,
  updateCurrentGeneration,
  forceGenerationUpdate,
  getCurrentGeneration
} from './modelCache';

export const createBestModelBrain = async (): Promise<INeuralNetwork> => {
  const { bestModelCache, currentGeneration } = getModelCache();
  
  if (bestModelCache) {
    console.log(`Usando el mejor modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
    
    // Force a small generation increment each time to ensure progression
    const newGeneration = Math.max(currentGeneration, bestModelCache.getGeneration()) + 2;
    console.log(`🟡 YELLOW SNAKE: Nueva generación ${newGeneration} 🟡`);
    
    // Use moderate mutation rate for best model (0.25)
    const brain = bestModelCache.clone(0.25); // Increased mutation rate for more exploration
    
    // Force update generation and make sure it's applied
    brain.updateGeneration(newGeneration);
    
    // Explicitly update the global generation tracker
    forceGenerationUpdate(newGeneration);
    
    console.log(`🟡 YELLOW SNAKE: Best model brain created with generation ${brain.getGeneration()} 🟡`);
    return brain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Ensure a generation increment to maintain progress
        const newGeneration = Math.max(currentGeneration, bestModel.getGeneration()) + 2;
        console.log(`🟡 YELLOW SNAKE: Nueva generación ${newGeneration} 🟡`);
        
        // Use balanced mutation rate (0.3)
        const brain = bestModel.clone(0.3); // Increased mutation rate for more exploration
        
        // Force update generation and ensure it's applied globally
        brain.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        console.log(`🟡 YELLOW SNAKE: Loaded best model brain with generation ${brain.getGeneration()} 🟡`);
        return brain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        // Use current generation or at least 2 if starting fresh
        const newGeneration = Math.max(currentGeneration, 2);
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        setBestModelCache(brain); // Cache the new model too
        console.log(`🟡 YELLOW SNAKE: New model brain created with generation ${brain.getGeneration()} 🟡`);
        return brain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      // Use current generation or at least 2 if starting fresh
      const newGeneration = Math.max(currentGeneration, 2);
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
      
      setBestModelCache(brain);
      console.log(`🟡 YELLOW SNAKE: Fallback model brain created with generation ${brain.getGeneration()} 🟡`);
      return brain;
    }
  }
};

export const createCombinedModelBrain = async (): Promise<INeuralNetwork> => {
  const { combinedModelCache, currentGeneration } = getModelCache();
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    
    // Create a new generation that's slightly higher than current
    const newGeneration = Math.max(currentGeneration, combinedModelCache.getGeneration()) + 2;
    console.log(`🔵 BLUE SNAKE: Nueva generación ${newGeneration} 🔵`);
    
    // Higher mutation rate for combined model (0.35)
    const brain = combinedModelCache.clone(0.35);
    
    // Force update generation to ensure progression
    brain.updateGeneration(newGeneration);
    updateCurrentGeneration(newGeneration);
    
    console.log(`🔵 BLUE SNAKE: Combined model brain created with generation ${brain.getGeneration()} 🔵`);
    return brain;
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        console.log(`Modelo combinado creado (generación ${combinedModel.getGeneration()})`);
        
        // Create a new generation that's slightly higher
        const newGeneration = Math.max(currentGeneration, combinedModel.getGeneration()) + 2;
        console.log(`🔵 BLUE SNAKE: Nueva generación ${newGeneration} 🔵`);
        
        // Higher mutation rate
        const brain = combinedModel.clone(0.35);
        
        // Force update generation to ensure progression
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        console.log(`🔵 BLUE SNAKE: Loaded combined model brain with generation ${brain.getGeneration()} 🔵`);
        return brain;
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        // Use current generation or at least 2
        const newGeneration = Math.max(currentGeneration, 2);
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        setCombinedModelCache(brain);
        console.log(`🔵 BLUE SNAKE: Fallback combined model brain created with generation ${brain.getGeneration()} 🔵`);
        return brain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      // Use current generation or at least 2
      const newGeneration = Math.max(currentGeneration, 2);
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(newGeneration);
      updateCurrentGeneration(newGeneration);
      
      setCombinedModelCache(brain);
      console.log(`🔵 BLUE SNAKE: Error fallback combined model brain created with generation ${brain.getGeneration()} 🔵`);
      return brain;
    }
  }
};

export const createRandomBrain = (baseId: number): INeuralNetwork => {
  const { bestModelCache, combinedModelCache, currentGeneration } = getModelCache();
  const baseModel = baseId % 2 === 0 ? bestModelCache : combinedModelCache;
  
  if (baseModel) {
    // Create a mutated clone from one of our base models
    console.log(`Creando un nuevo modelo con mutaciones para la serpiente ${baseId} (generación ${currentGeneration})`);
    
    // Force generation to current or higher
    // Always add at least 1 to ensure progression
    const newGeneration = Math.max(currentGeneration, baseModel.getGeneration()) + 1;
    
    // Higher mutation rate for random models (0.4)
    const brain = baseModel.clone(0.4);
    
    // Ensure this brain has the current generation
    brain.updateGeneration(newGeneration);
    
    // Apply higher mutation rate for exploration
    brain.mutate(0.45);
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: created from base with generation ${brain.getGeneration()} 🟢`);
    return brain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${currentGeneration})`);
    
    const brain = new NeuralNetwork(8, 12, 4);
    
    // Ensure this brain has at least the current generation + 1
    brain.updateGeneration(Math.max(currentGeneration, 1) + 1);
    
    brain.mutate(0.5); // Higher mutation for new models
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: Brand new model with generation ${brain.getGeneration()} 🟢`);
    return brain;
  }
};
