
import { supabase } from "@/integrations/supabase/client";
import { NeuralNetwork } from "./NeuralNetwork";
import { NeuralNetworkModel } from "./types";
import { combineWeights, mutateWeights } from "./neuralNetworkUtils";

/**
 * Fetches the best neural network model from the database
 */
export const fetchBestModel = async (): Promise<NeuralNetwork | null> => {
  try {
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error('Error loading best neural network:', error);
      return null;
    }
    
    const model = data[0];
    // Ensure weights is treated as number[]
    const weightsArray = model.weights as unknown as number[];
    
    // Extract metadata if available
    const bestScore = model.metadata?.best_score || model.score || 0;
    const gamesPlayed = model.metadata?.games_played || 0;
    
    return new NeuralNetwork(
      8, 
      12, 
      4, 
      weightsArray, 
      model.id, 
      model.score, 
      model.generation,
      bestScore,
      gamesPlayed
    );
  } catch (err) {
    console.error('Exception loading best neural network:', err);
    return null;
  }
};

/**
 * Saves a neural network model to the database
 */
export const saveModel = async (
  network: NeuralNetwork, 
  score: number,
  bestScore?: number,
  gamesPlayed?: number
): Promise<string | null> => {
  try {
    const weights = network.getWeights();
    const id = network.getId();
    const generation = network.getGeneration();
    
    // Create metadata for storing additional fields
    const metadata = {
      best_score: bestScore || score,
      games_played: gamesPlayed || 0
    };
    
    if (id) {
      // Update existing model
      const { error } = await supabase
        .from('neural_networks')
        .update({
          weights: weights,
          score: score,
          metadata: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating neural network:', error);
        return null;
      }
      
      return id;
    } else {
      // Create new model
      const { data, error } = await supabase
        .from('neural_networks')
        .insert({
          weights: weights,
          score: score,
          generation: generation,
          metadata: metadata
        })
        .select('id');
      
      if (error || !data || data.length === 0) {
        console.error('Error saving neural network:', error);
        return null;
      }
      
      return data[0].id;
    }
  } catch (err) {
    console.error('Exception saving neural network:', err);
    return null;
  }
};

/**
 * Saves training data to the database
 */
export const saveTrainingData = async (
  id: string | null,
  inputs: number[], 
  outputs: number[], 
  success: boolean
): Promise<void> => {
  if (!id) return;
  
  try {
    const { error } = await supabase
      .from('training_data')
      .insert({
        inputs: inputs,
        outputs: outputs,
        success: success,
        neural_network_id: id
      });
    
    if (error) {
      console.error('Error saving training data:', error);
    }
  } catch (err) {
    console.error('Exception saving training data:', err);
  }
};

/**
 * Fetches all neural network models from the database
 */
export const fetchAllModels = async (): Promise<NeuralNetworkModel[]> => {
  try {
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false });
    
    if (error || !data) {
      console.error('Error loading all neural networks:', error);
      return [];
    }
    
    return data as NeuralNetworkModel[];
  } catch (err) {
    console.error('Exception loading all neural networks:', err);
    return [];
  }
};

/**
 * Combines multiple models to create a new evolved model
 */
export const combineModels = async (count: number = 5): Promise<NeuralNetwork | null> => {
  try {
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(count);
    
    if (error || !data || data.length === 0) {
      console.error('Error loading models for combination:', error);
      return null;
    }
    
    // Get the weight size from the first model
    const weightsArray = data[0].weights as unknown as number[];
    const weightsLength = weightsArray.length;
    
    // Calculate combined weights
    const { combinedWeights, newGeneration } = combineWeights(data, weightsLength);
    
    // Create a new model with the combined weights
    const combinedModel = new NeuralNetwork(8, 12, 4, combinedWeights, null, 0, newGeneration);
    
    // Add some mutation to explore new solutions
    const mutatedWeights = mutateWeights(combinedModel.getWeights());
    combinedModel.setWeights(mutatedWeights);
    
    // Save the combined model
    await saveModel(combinedModel, 0);
    
    return combinedModel;
  } catch (err) {
    console.error('Exception combining models:', err);
    return null;
  }
};
