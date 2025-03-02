
import { NeuralNetwork as INeuralNetwork } from '../../types';
import { NeuralNetwork } from '../../NeuralNetwork';
import { 
  getModelCache, 
  setBestModelCache, 
  setCombinedModelCache, 
  incrementGeneration,
  updateCurrentGeneration,
  forceGenerationUpdate
} from './modelCache';

export const createBestModelBrain = async (): Promise<INeuralNetwork> => {
  const { bestModelCache, currentGeneration } = getModelCache();
  
  if (bestModelCache) {
    console.log(`Usando el mejor modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
    
    // Force a significant generation increment every time to prevent stagnation
    // FIXED: Add +5 instead of +1 to force higher generations
    const newGeneration = Math.max(currentGeneration, bestModelCache.getGeneration()) + 5;
    console.log(`⚡ YELLOW SNAKE BOOST: Nueva generación forzada ${newGeneration} ⚡`);
    
    // Use lower mutation rate for best model (0.1)
    const brain = bestModelCache.clone(0.15); // Slightly increased mutation
    
    // Force update generation and make sure it's applied
    brain.updateGeneration(newGeneration);
    
    // Explicitly update the global generation tracker
    forceGenerationUpdate(newGeneration);
    
    console.log(`⭐ YELLOW SNAKE: Best model brain created with new forced generation ${brain.getGeneration()} ⭐`);
    return brain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Force a significant generation increment to break out of stagnation
        // FIXED: Add +5 instead of +2 to force higher generations
        const newGeneration = Math.max(currentGeneration, bestModel.getGeneration()) + 5;
        console.log(`⚡ YELLOW SNAKE BOOST: Nueva generación forzada ${newGeneration} ⚡`);
        
        // Use balanced mutation rate (0.15)
        const brain = bestModel.clone(0.15);
        
        // Force update generation and ensure it's applied globally
        brain.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        console.log(`⭐ YELLOW SNAKE: Loaded best model brain with generation ${brain.getGeneration()} ⭐`);
        return brain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        // For new models, force at least generation 10
        // FIXED: Start at much higher generation when no model exists
        const newGeneration = Math.max(currentGeneration, 10);
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(newGeneration);
        forceGenerationUpdate(newGeneration);
        
        setBestModelCache(brain); // Cache the new model too
        console.log(`⭐ YELLOW SNAKE: New model brain created with generation ${brain.getGeneration()} ⭐`);
        return brain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      // FIXED: Start at much higher generation to force progression
      const newGeneration = Math.max(currentGeneration, 10);
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(newGeneration);
      forceGenerationUpdate(newGeneration);
      
      setBestModelCache(brain);
      console.log(`⭐ YELLOW SNAKE: Fallback model brain created with generation ${brain.getGeneration()} ⭐`);
      return brain;
    }
  }
};

export const createCombinedModelBrain = async (): Promise<INeuralNetwork> => {
  const { combinedModelCache, currentGeneration } = getModelCache();
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    
    // Always create a new generation for evolution
    const newGeneration = Math.max(currentGeneration, combinedModelCache.getGeneration()) + 1;
    console.log(`Nueva generación para modelo combinado: ${newGeneration}`);
    
    // Moderate mutation rate for combined model (0.15)
    const brain = combinedModelCache.clone(0.15);
    
    // Force update generation to ensure progression
    brain.updateGeneration(newGeneration);
    updateCurrentGeneration(newGeneration);
    
    console.log(`Combined model brain created with generation ${brain.getGeneration()}`);
    return brain;
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        console.log(`Modelo combinado creado (generación ${combinedModel.getGeneration()})`);
        
        // Always create a new generation for evolution
        const newGeneration = Math.max(currentGeneration, combinedModel.getGeneration()) + 1;
        console.log(`Nueva generación para modelo combinado nuevo: ${newGeneration}`);
        
        // Moderate mutation rate
        const brain = combinedModel.clone(0.15);
        
        // Force update generation to ensure progression
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        console.log(`Loaded combined model brain created with generation ${brain.getGeneration()}`);
        return brain;
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        const newGeneration = Math.max(currentGeneration, 2);
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        setCombinedModelCache(brain);
        console.log(`Fallback combined model brain created with generation ${brain.getGeneration()}`);
        return brain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      const newGeneration = Math.max(currentGeneration, 2);
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(newGeneration);
      updateCurrentGeneration(newGeneration);
      
      setCombinedModelCache(brain);
      console.log(`Error fallback combined model brain created with generation ${brain.getGeneration()}`);
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
    
    // Balanced mutation rate for random models (0.2)
    const brain = baseModel.clone(0.2);
    
    // Ensure this brain has the current generation
    brain.updateGeneration(newGeneration);
    
    // Apply moderate mutation rate for exploration
    brain.mutate(0.25);
    
    console.log(`Random model brain created from base with generation ${brain.getGeneration()}`);
    return brain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${currentGeneration})`);
    
    const brain = new NeuralNetwork(8, 12, 4);
    
    // Ensure this brain has at least the current generation + 1
    brain.updateGeneration(Math.max(currentGeneration, 1) + 1);
    
    brain.mutate(0.3); // Moderate mutation for new models
    
    console.log(`Brand new random model brain created with generation ${brain.getGeneration()}`);
    return brain;
  }
};
