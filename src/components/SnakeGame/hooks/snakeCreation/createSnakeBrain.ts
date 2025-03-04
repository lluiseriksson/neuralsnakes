
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
    
    // Force all snakes to use the same generation - use global value
    // Instead of incrementing, use the exact global generation
    const globalGen = getCurrentGeneration();
    console.log(`🟡 YELLOW SNAKE: Using global generation ${globalGen} 🟡`);
    
    // Use moderate mutation rate for best model (0.25)
    const brain = bestModelCache.clone(0.25);
    
    // Force update generation to global value
    brain.updateGeneration(globalGen);
    
    console.log(`🟡 YELLOW SNAKE: Best model brain created with generation ${brain.getGeneration()} 🟡`);
    return brain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Use global generation value
        const globalGen = getCurrentGeneration();
        console.log(`🟡 YELLOW SNAKE: Using global generation ${globalGen} 🟡`);
        
        // Use balanced mutation rate (0.3)
        const brain = bestModel.clone(0.3);
        
        // Force update to global generation
        brain.updateGeneration(globalGen);
        
        console.log(`🟡 YELLOW SNAKE: Loaded best model brain with generation ${brain.getGeneration()} 🟡`);
        return brain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        // Use global generation
        const globalGen = getCurrentGeneration();
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(globalGen);
        
        setBestModelCache(brain); // Cache the new model too
        console.log(`🟡 YELLOW SNAKE: New model brain created with generation ${brain.getGeneration()} 🟡`);
        return brain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      // Use global generation
      const globalGen = getCurrentGeneration();
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(globalGen);
      
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
    
    // Use global generation
    const globalGen = getCurrentGeneration();
    console.log(`🔵 BLUE SNAKE: Using global generation ${globalGen} 🔵`);
    
    // Higher mutation rate for combined model (0.35)
    const brain = combinedModelCache.clone(0.35);
    
    // Force update to global generation
    brain.updateGeneration(globalGen);
    
    console.log(`🔵 BLUE SNAKE: Combined model brain created with generation ${brain.getGeneration()} 🔵`);
    return brain;
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        console.log(`Modelo combinado creado (generación ${combinedModel.getGeneration()})`);
        
        // Use global generation
        const globalGen = getCurrentGeneration();
        console.log(`🔵 BLUE SNAKE: Using global generation ${globalGen} 🔵`);
        
        // Higher mutation rate
        const brain = combinedModel.clone(0.35);
        
        // Force update to global generation
        brain.updateGeneration(globalGen);
        
        console.log(`🔵 BLUE SNAKE: Loaded combined model brain with generation ${brain.getGeneration()} 🔵`);
        return brain;
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        // Use global generation
        const globalGen = getCurrentGeneration();
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(globalGen);
        
        setCombinedModelCache(brain);
        console.log(`🔵 BLUE SNAKE: Fallback combined model brain created with generation ${brain.getGeneration()} 🔵`);
        return brain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      // Use global generation
      const globalGen = getCurrentGeneration();
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(globalGen);
      
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
    
    // Use global generation directly
    const globalGen = getCurrentGeneration();
    
    // Higher mutation rate for random models (0.4)
    const brain = baseModel.clone(0.4);
    
    // Force update to global generation
    brain.updateGeneration(globalGen);
    
    // Apply higher mutation rate for exploration
    brain.mutate(0.45);
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: created from base with generation ${brain.getGeneration()} 🟢`);
    return brain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${currentGeneration})`);
    
    const brain = new NeuralNetwork(8, 12, 4);
    
    // Force global generation
    const globalGen = getCurrentGeneration();
    brain.updateGeneration(globalGen);
    
    brain.mutate(0.5); // Higher mutation for new models
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: Brand new model with generation ${brain.getGeneration()} 🟢`);
    return brain;
  }
};
