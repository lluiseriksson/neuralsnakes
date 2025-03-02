
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
    
    // Always increment generation for evolutionary progress
    const newGeneration = currentGeneration + 1;
    console.log(`Nueva generación para mejor modelo: ${newGeneration}`);
    
    // Use a lower mutation rate for the best model to preserve good behaviors
    const brain = bestModelCache.clone(0.05);
    
    // Create a new instance with the updated generation
    const weights = brain.getWeights();
    const newBrain = new NeuralNetwork(
      8, 12, 4, weights, brain.getId(), 0, newGeneration, 
      brain.getBestScore(), brain.getGamesPlayed() + 1
    );
    
    // Force update the generation counter
    incrementGeneration();
    
    return newBrain;
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        
        // Always increment generation for evolutionary progress
        const newGeneration = Math.max(currentGeneration + 1, bestModel.getGeneration() + 1);
        console.log(`Nueva generación para mejor modelo cargado: ${newGeneration}`);
        
        // Use a lower mutation rate for the best model
        const brain = bestModel.clone(0.05);
        
        // Create a new instance with the updated generation
        const weights = brain.getWeights();
        const newBrain = new NeuralNetwork(
          8, 12, 4, weights, brain.getId(), 0, newGeneration, 
          brain.getBestScore(), brain.getGamesPlayed() + 1
        );
        
        // Force update the generation counter
        incrementGeneration();
        
        return newBrain;
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        const brain = new NeuralNetwork(8, 12, 4);
        
        // For new models, start with generation 1
        const newBrain = new NeuralNetwork(
          8, 12, 4, brain.getWeights(), null, 0, 1
        );
        setBestModelCache(newBrain); // Cache the new model too
        return newBrain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      const brain = new NeuralNetwork(8, 12, 4);
      const newBrain = new NeuralNetwork(
        8, 12, 4, brain.getWeights(), null, 0, 1
      );
      setBestModelCache(newBrain);
      return newBrain;
    }
  }
};

export const createCombinedModelBrain = async (): Promise<INeuralNetwork> => {
  const { combinedModelCache, currentGeneration } = getModelCache();
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    
    // Always increment generation for evolutionary progress
    const newGeneration = currentGeneration + 1;
    console.log(`Nueva generación para modelo combinado: ${newGeneration}`);
    
    const brain = combinedModelCache.clone(0.08);
    
    // Create a new instance with the updated generation
    const weights = brain.getWeights();
    const newBrain = new NeuralNetwork(
      8, 12, 4, weights, brain.getId(), 0, newGeneration, 
      brain.getBestScore(), brain.getGamesPlayed() + 1
    );
    
    // Force update the generation counter
    incrementGeneration();
    
    return newBrain;
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        console.log(`Modelo combinado creado (generación ${combinedModel.getGeneration()})`);
        
        // Always increment generation for evolutionary progress
        const newGeneration = Math.max(currentGeneration + 1, combinedModel.getGeneration() + 1);
        console.log(`Nueva generación para modelo combinado nuevo: ${newGeneration}`);
        
        const brain = combinedModel.clone(0.08);
        
        // Create a new instance with the updated generation
        const weights = brain.getWeights();
        const newBrain = new NeuralNetwork(
          8, 12, 4, weights, brain.getId(), 0, newGeneration, 
          brain.getBestScore(), brain.getGamesPlayed() + 1
        );
        
        // Force update the generation counter
        incrementGeneration();
        
        return newBrain;
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        const brain = new NeuralNetwork(8, 12, 4);
        const newBrain = new NeuralNetwork(
          8, 12, 4, brain.getWeights(), null, 0, 1
        );
        setCombinedModelCache(newBrain);
        return newBrain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      const brain = new NeuralNetwork(8, 12, 4);
      const newBrain = new NeuralNetwork(
        8, 12, 4, brain.getWeights(), null, 0, 1
      );
      setCombinedModelCache(newBrain);
      return newBrain;
    }
  }
};

export const createRandomBrain = (baseId: number): INeuralNetwork => {
  const { bestModelCache, combinedModelCache, currentGeneration } = getModelCache();
  const baseModel = baseId % 2 === 0 ? bestModelCache : combinedModelCache;
  
  if (baseModel) {
    // Create a mutated clone from one of our base models
    console.log(`Creando un nuevo modelo con mutaciones para la serpiente ${baseId} (generación ${currentGeneration})`);
    const brain = baseModel.clone(0.15);
    
    // Use the current generation
    const weights = brain.getWeights();
    const newBrain = new NeuralNetwork(
      8, 12, 4, weights, null, 0, currentGeneration
    );
    // Apply higher mutation rate for random models to explore new strategies
    newBrain.mutate(0.2);
    return newBrain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId} (generación ${currentGeneration})`);
    const brain = new NeuralNetwork(8, 12, 4);
    const newBrain = new NeuralNetwork(
      8, 12, 4, brain.getWeights(), null, 0, currentGeneration
    );
    newBrain.mutate(0.25); // Higher mutation for completely new models
    return newBrain;
  }
};
