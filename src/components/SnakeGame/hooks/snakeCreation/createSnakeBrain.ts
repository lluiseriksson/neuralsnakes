
import { NeuralNetwork as INeuralNetwork } from '../../types';
import { NeuralNetwork } from '../../NeuralNetwork';
import { 
  getModelCache, 
  setBestModelCache, 
  setCombinedModelCache, 
  incrementGeneration,
  updateCurrentGeneration 
} from './modelCache';

export const createBestModelBrain = async (): Promise<INeuralNetwork> => {
  const { bestModelCache, currentGeneration } = getModelCache();
  
  if (bestModelCache) {
    console.log(`Usando el mejor modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
    
    // Always create a new generation for evolution
    // Increment by 2 to force faster evolution
    const newGeneration = Math.max(currentGeneration, bestModelCache.getGeneration()) + 2;
    console.log(`Nueva generación para mejor modelo: ${newGeneration}`);
    
    // Use a HIGHER mutation rate for the best model to encourage exploration
    const brain = bestModelCache.clone(0.2);
    
    // Force update generation to ensure progression
    brain.updateGeneration(newGeneration);
    updateCurrentGeneration(newGeneration);
    
    console.log(`Best model brain created with generation ${brain.getGeneration()}`);
    return brain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Always increment generation for evolutionary progress
        // Increment by 2 to force faster evolution
        const newGeneration = Math.max(currentGeneration, bestModel.getGeneration()) + 2;
        console.log(`Nueva generación para mejor modelo cargado: ${newGeneration}`);
        
        // Use a HIGHER mutation rate for the best model
        const brain = bestModel.clone(0.2);
        
        // Force update generation to ensure progression
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        console.log(`Loaded best model brain created with generation ${brain.getGeneration()}`);
        return brain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        // For new models, force at least generation 2
        const newGeneration = Math.max(currentGeneration, 2);
        const brain = new NeuralNetwork(8, 12, 4);
        brain.updateGeneration(newGeneration);
        updateCurrentGeneration(newGeneration);
        
        setBestModelCache(brain); // Cache the new model too
        console.log(`New model brain created with generation ${brain.getGeneration()}`);
        return brain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      const newGeneration = Math.max(currentGeneration, 2);
      const brain = new NeuralNetwork(8, 12, 4);
      brain.updateGeneration(newGeneration);
      updateCurrentGeneration(newGeneration);
      
      setBestModelCache(brain);
      console.log(`Fallback model brain created with generation ${brain.getGeneration()}`);
      return brain;
    }
  }
};

export const createCombinedModelBrain = async (): Promise<INeuralNetwork> => {
  const { combinedModelCache, currentGeneration } = getModelCache();
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    
    // Always create a new generation for evolution
    // Increment by 2 to force faster evolution
    const newGeneration = Math.max(currentGeneration, combinedModelCache.getGeneration()) + 2;
    console.log(`Nueva generación para modelo combinado: ${newGeneration}`);
    
    // Higher mutation rate
    const brain = combinedModelCache.clone(0.25);
    
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
        // Increment by 2 to force faster evolution
        const newGeneration = Math.max(currentGeneration, combinedModel.getGeneration()) + 2;
        console.log(`Nueva generación para modelo combinado nuevo: ${newGeneration}`);
        
        // Higher mutation rate
        const brain = combinedModel.clone(0.25);
        
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
    
    // MUCH higher mutation rate for random models to escape local optima
    const brain = baseModel.clone(0.35);
    
    // Ensure this brain has the current generation
    brain.updateGeneration(newGeneration);
    
    // Apply higher mutation rate for random models to explore new strategies
    brain.mutate(0.4);
    
    console.log(`Random model brain created from base with generation ${brain.getGeneration()}`);
    return brain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${currentGeneration})`);
    
    const brain = new NeuralNetwork(8, 12, 4);
    
    // Ensure this brain has at least the current generation + 1
    brain.updateGeneration(Math.max(currentGeneration, 1) + 1);
    
    brain.mutate(0.5); // Much higher mutation for completely new models
    
    console.log(`Brand new random model brain created with generation ${brain.getGeneration()}`);
    return brain;
  }
};
