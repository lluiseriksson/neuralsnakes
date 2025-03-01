
import { NeuralNetwork as INeuralNetwork } from '../../types';
import { NeuralNetwork } from '../../NeuralNetwork';
import { 
  getModelCache, 
  setBestModelCache, 
  setCombinedModelCache, 
  updateCurrentGeneration 
} from './modelCache';

export const createBestModelBrain = async (): Promise<INeuralNetwork> => {
  const { bestModelCache, currentGeneration } = getModelCache();
  
  if (bestModelCache) {
    console.log(`Usando el mejor modelo en cache (generación ${bestModelCache.getGeneration()}, puntuación: ${bestModelCache.getBestScore()})`);
    // Use a lower mutation rate for the best model to preserve good behaviors
    const brain = bestModelCache.clone(0.05);
    
    // Force generation increment if model is being reused
    const updatedGeneration = updateCurrentGeneration(bestModelCache.getGeneration() + 1);
    
    // Update the generation manually to ensure progression
    const weights = brain.getWeights();
    return new NeuralNetwork(
      8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
      brain.getBestScore(), brain.getGamesPlayed() + 1
    );
  } else {
    console.log("Cargando el mejor modelo...");
    try {
      const bestModel = await NeuralNetwork.loadBest();
      if (bestModel) {
        setBestModelCache(bestModel); // Store in cache
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()}, puntuación: ${bestModel.getBestScore()})`);
        // Use a lower mutation rate for the best model
        const brain = bestModel.clone(0.05);
        
        // Force generation increment
        const updatedGeneration = updateCurrentGeneration(bestModel.getGeneration() + 1);
        
        // Update the generation manually
        const weights = brain.getWeights();
        return new NeuralNetwork(
          8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
          brain.getBestScore(), brain.getGamesPlayed() + 1
        );
      } else {
        console.log("No se encontró un modelo existente, creando uno nuevo");
        const brain = new NeuralNetwork(8, 12, 4);
        const newBrain = new NeuralNetwork(
          8, 12, 4, brain.getWeights(), null, 0, currentGeneration
        );
        setBestModelCache(newBrain); // Cache the new model too
        return newBrain;
      }
    } catch (loadError) {
      console.error("Error cargando el mejor modelo:", loadError);
      const brain = new NeuralNetwork(8, 12, 4);
      const newBrain = new NeuralNetwork(
        8, 12, 4, brain.getWeights(), null, 0, currentGeneration
      );
      setBestModelCache(newBrain);
      return newBrain;
    }
  }
};

export const createCombinedModelBrain = async (): Promise<INeuralNetwork> => {
  const { combinedModelCache, currentGeneration } = getModelCache();
  
  if (combinedModelCache) {
    console.log(`Usando modelo combinado (generación ${combinedModelCache.getGeneration()})`);
    const brain = combinedModelCache.clone(0.08);
    
    // Force generation increment
    const updatedGeneration = updateCurrentGeneration(combinedModelCache.getGeneration() + 1);
    
    // Update the generation manually
    const weights = brain.getWeights();
    return new NeuralNetwork(
      8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
      brain.getBestScore(), brain.getGamesPlayed() + 1
    );
  } else {
    console.log("Creando un nuevo modelo combinado...");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        const brain = combinedModel.clone(0.08);
        
        // Force generation increment
        const updatedGeneration = updateCurrentGeneration(combinedModel.getGeneration() + 1);
        
        // Update the generation manually
        const weights = brain.getWeights();
        return new NeuralNetwork(
          8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
          brain.getBestScore(), brain.getGamesPlayed() + 1
        );
      } else {
        console.log("No se pudo combinar modelos, creando uno nuevo");
        const brain = new NeuralNetwork(8, 12, 4);
        const newBrain = new NeuralNetwork(
          8, 12, 4, brain.getWeights(), null, 0, currentGeneration
        );
        setCombinedModelCache(newBrain);
        return newBrain;
      }
    } catch (combineError) {
      console.error("Error combining models:", combineError);
      const brain = new NeuralNetwork(8, 12, 4);
      const newBrain = new NeuralNetwork(
        8, 12, 4, brain.getWeights(), null, 0, currentGeneration
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
    console.log(`Creando un nuevo modelo con mutaciones para la serpiente ${baseId}`);
    const brain = baseModel.clone(0.15);
    
    // Update the generation
    const weights = brain.getWeights();
    const newBrain = new NeuralNetwork(
      8, 12, 4, weights, null, 0, currentGeneration
    );
    // Apply higher mutation rate for random models to explore new strategies
    newBrain.mutate(0.2);
    return newBrain;
  } else {
    // Brand new model
    console.log(`Creando un modelo totalmente nuevo para la serpiente ${baseId}`);
    const brain = new NeuralNetwork(8, 12, 4);
    const newBrain = new NeuralNetwork(
      8, 12, 4, brain.getWeights(), null, 0, currentGeneration
    );
    newBrain.mutate(0.25); // Higher mutation for completely new models
    return newBrain;
  }
};
