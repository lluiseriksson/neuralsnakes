
import { supabase } from "@/integrations/supabase/client";
import { NeuralNetworkModel } from "../types";

/**
 * Fetches the best neural network model from the database
 */
export const fetchBestModelFromDb = async (): Promise<NeuralNetworkModel | null> => {
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
    
    return data[0] as NeuralNetworkModel;
  } catch (err) {
    console.error('Exception loading best neural network:', err);
    return null;
  }
};

/**
 * Saves or updates a neural network model to the database
 */
export const saveModelToDb = async (
  id: string | null,
  weights: number[],
  score: number,
  generation: number,
  metadata: Record<string, any>
): Promise<string | null> => {
  try {
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
export const saveTrainingDataToDb = async (
  neuralNetworkId: string | null,
  inputs: number[], 
  outputs: number[], 
  success: boolean
): Promise<void> => {
  if (!neuralNetworkId) return;
  
  try {
    const { error } = await supabase
      .from('training_data')
      .insert({
        inputs: inputs,
        outputs: outputs,
        success: success,
        neural_network_id: neuralNetworkId
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
export const fetchAllModelsFromDb = async (): Promise<NeuralNetworkModel[]> => {
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
