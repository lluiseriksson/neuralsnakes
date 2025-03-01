
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
    console.log(`Usando modelo en cache (generación ${bestModelCache.getGeneration()})`);
    const brain = bestModelCache.clone(0.1);
    
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
        console.log(`Modelo cargado (generación ${bestModel.getGeneration()})`);
        const brain = bestModel.clone(0.1);
        
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
    console.log(`Usando modelo combinado en cache (generación ${combinedModelCache.getGeneration()})`);
    const brain = combinedModelCache.clone(0.05);
    
    // Force generation increment
    const updatedGeneration = updateCurrentGeneration(combinedModelCache.getGeneration() + 1);
    
    // Update the generation manually
    const weights = brain.getWeights();
    return new NeuralNetwork(
      8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
      brain.getBestScore(), brain.getGamesPlayed() + 1
    );
  } else {
    console.log("Creando un nuevo modelo para la serpiente 1");
    try {
      const combinedModel = await NeuralNetwork.combineModels(5);
      if (combinedModel) {
        setCombinedModelCache(combinedModel);
        const brain = combinedModel.clone(0.05);
        
        // Force generation increment
        const updatedGeneration = updateCurrentGeneration(combinedModel.getGeneration() + 1);
        
        // Update the generation manually
        const weights = brain.getWeights();
        return new NeuralNetwork(
          8, 12, 4, weights, brain.getId(), 0, updatedGeneration, 
          brain.getBestScore(), brain.getGamesPlayed() + 1
        );
      } else {
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
    const brain = baseModel.clone(0.2);
    
    // Update the generation
    const weights = brain.getWeights();
    const newBrain = new NeuralNetwork(
      8, 12, 4, weights, null, 0, currentGeneration
    );
    newBrain.mutate(0.2);
    return newBrain;
  } else {
    // Brand new model
    const brain = new NeuralNetwork(8, 12, 4);
    const newBrain = new NeuralNetwork(
      8, 12, 4, brain.getWeights(), null, 0, currentGeneration
    );
    newBrain.mutate(0.2);
    return newBrain;
  }
};
