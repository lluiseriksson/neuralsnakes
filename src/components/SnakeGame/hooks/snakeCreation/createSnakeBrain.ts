
import { NeuralNetwork as INeuralNetwork } from '../../types';
import { NeuralNetwork } from '../../NeuralNetwork';
import { 
  getModelCache, 
  setBestModelCache, 
  setCombinedModelCache, 
  getCurrentGeneration,
  forceGenerationUpdate
} from './modelCache';

export const createBestModelBrain = async (): Promise<INeuralNetwork> => {
  const { bestModelCache, currentGeneration } = getModelCache();
  
  // This is critical - log the true current generation
  const globalGen = getCurrentGeneration();
  console.log(`GLOBAL GENERATION when creating best model brain: ${globalGen}`);
  
  if (bestModelCache) {
    console.log(`Usando el mejor modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
    
    // Always use global generation for yellow snake
    console.log(`🟡 YELLOW SNAKE: Using global generation ${globalGen} 🟡`);
    
    // Use moderate mutation rate for best model (0.25)
    const brain = bestModelCache.clone(0.25);
    
    // IMPORTANT: Force update to global generation for yellow snake
    brain.updateGeneration(globalGen);
    
    console.log(`🟡 YELLOW SNAKE: Best model brain created with generation ${brain.getGeneration()} 🟡`);
    return brain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        // FIXED: Always verify and update to current global generation
        bestModel.updateGeneration(globalGen);
        
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Always use global generation for yellow snake
        console.log(`🟡 YELLOW SNAKE: Using global generation ${globalGen} 🟡`);
        
        // Use balanced mutation rate (0.3)
        const brain = bestModel.clone(0.3);
        
        // IMPORTANT: Force update to global generation for yellow snake
        brain.updateGeneration(globalGen);
        
        console.log(`🟡 YELLOW SNAKE: Loaded best model brain with generation ${brain.getGeneration()} 🟡`);
        return brain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        // Use global generation
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(globalGen);
        
        setBestModelCache(brain); // Cache the new model too
        console.log(`🟡 YELLOW SNAKE: New model brain created with generation ${brain.getGeneration()} 🟡`);
        return brain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      // Use global generation
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
  
  // Get the current global generation for proper alignment
  const globalGen = getCurrentGeneration();
  console.log(`GLOBAL GENERATION when creating combined model brain: ${globalGen}`);
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    
    // FIXED: Blue snake should also use global generation for consistency
    console.log(`🔵 BLUE SNAKE: Using global generation ${globalGen} 🔵`);
    
    // Higher mutation rate for combined model (0.35)
    const brain = combinedModelCache.clone(0.35);
    
    // FIXED: Force update to global generation for blue snake
    brain.updateGeneration(globalGen);
    
    console.log(`🔵 BLUE SNAKE: Combined model brain created with generation ${brain.getGeneration()} 🔵`);
    return brain;
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        // FIXED: Always verify and update to current global generation
        combinedModel.updateGeneration(globalGen);
        
        setCombinedModelCache(combinedModel);
        console.log(`Modelo combinado creado (generación ${combinedModel.getGeneration()})`);
        
        // FIXED: Blue snake should use global generation
        console.log(`🔵 BLUE SNAKE: Using global generation ${globalGen} 🔵`);
        
        // Higher mutation rate
        const brain = combinedModel.clone(0.35);
        
        // FIXED: Force update to global generation
        brain.updateGeneration(globalGen);
        
        console.log(`🔵 BLUE SNAKE: Combined model brain created with generation ${brain.getGeneration()} 🔵`);
        return brain;
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        // Use global generation
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(globalGen);
        
        setCombinedModelCache(brain);
        console.log(`🔵 BLUE SNAKE: Fallback combined model brain created with generation ${brain.getGeneration()} 🔵`);
        return brain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      // Use global generation
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
  
  // Get the current global generation for proper alignment
  const globalGen = getCurrentGeneration();
  console.log(`GLOBAL GENERATION when creating random brain: ${globalGen}`);
  
  if (baseModel) {
    // Create a mutated clone from one of our base models
    console.log(`Creando un nuevo modelo con mutaciones para la serpiente ${baseId} (generación ${globalGen})`);
    
    // FIXED: Always use the global generation for random snakes
    
    // Higher mutation rate for random models (0.4)
    const brain = baseModel.clone(0.4);
    
    // FIXED: Force update to global generation for all random snakes
    brain.updateGeneration(globalGen);
    
    // Apply higher mutation rate for exploration
    brain.mutate(0.45);
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: created from base with generation ${brain.getGeneration()} 🟢`);
    return brain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${globalGen})`);
    
    const brain = new NeuralNetwork(8, 12, 4);
    
    // FIXED: Always use global generation for all random snakes
    brain.updateGeneration(globalGen);
    
    brain.mutate(0.5); // Higher mutation for new models
    
    console.log(`🟢 RANDOM SNAKE ${baseId}: Brand new model with generation ${brain.getGeneration()} 🟢`);
    return brain;
  }
};
