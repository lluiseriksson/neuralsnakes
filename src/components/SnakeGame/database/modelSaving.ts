
import { supabase } from "@/integrations/supabase/client";
import { NeuralNetworkModel } from "../types";
import { generateClientId, saveModelToLocalStorage } from "./localStorageUtils";

/**
 * Saves or updates a neural network model to the database
 * Also saves to localStorage as a backup
 */
export const saveModelToDb = async (
  id: string | null,
  weights: number[],
  score: number,
  generation: number,
  metadata: Record<string, any>
): Promise<string | null> => {
  try {
    let modelId = id;
    
    // First save to Supabase
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
          console.error('Error updating neural network in DB:', error);
        }
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
        
        if (error) {
          console.error('Error saving neural network to DB:', error);
        } else if (data && data.length > 0) {
          modelId = data[0].id;
        }
      }
    } catch (dbErr) {
      console.error('Database exception when saving neural network:', dbErr);
    }
    
    // Generate a client-side ID if we don't have one from the server
    if (!modelId) {
      modelId = generateClientId();
    }
    
    // Always save to localStorage as backup
    try {
      // Extract best_score and games_played from metadata
      const best_score = metadata.best_score || score;
      const games_played = metadata.games_played || 0;
      
      // Create a properly formatted NeuralNetworkModel
      const model: NeuralNetworkModel = {
        id: modelId,
        weights: weights,
        score: score,
        generation: generation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        best_score: best_score,
        games_played: games_played,
        metadata: metadata
      };
      
      saveModelToLocalStorage(model);
    } catch (storageErr) {
      console.warn('Error saving to localStorage:', storageErr);
    }
    
    return modelId;
  } catch (err) {
    console.error('Exception saving neural network:', err);
    return null;
  }
};

/**
 * Saves training data to the database
 * Silently fails if database is unavailable
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
      console.warn('Error saving training data (continuing without saving):', error);
    }
  } catch (err) {
    console.warn('Exception saving training data (continuing without saving):', err);
  }
};
