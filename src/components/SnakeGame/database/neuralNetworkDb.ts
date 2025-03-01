import { supabase } from "@/integrations/supabase/client";
import { NeuralNetworkModel } from "../types";

// Local storage keys
const LOCAL_STORAGE_KEY_BEST_MODEL = 'snake_ai_best_model';
const LOCAL_STORAGE_KEY_ALL_MODELS = 'snake_ai_all_models';

/**
 * Fetches the best neural network model from the database
 * Falls back to localStorage if database connection fails
 */
export const fetchBestModelFromDb = async (): Promise<NeuralNetworkModel | null> => {
  try {
    // First try to fetch from Supabase
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error loading best neural network from DB:', error);
      // Fall back to localStorage
      return loadBestModelFromLocalStorage();
    }
    
    if (!data || data.length === 0) {
      console.log('No best model found in database, checking localStorage');
      return loadBestModelFromLocalStorage();
    }
    
    // Update localStorage cache
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BEST_MODEL, JSON.stringify(data[0]));
    } catch (storageErr) {
      console.warn('Failed to cache best model to localStorage:', storageErr);
    }
    
    return data[0] as NeuralNetworkModel;
  } catch (err) {
    console.error('Exception loading best neural network from DB:', err);
    // Fall back to localStorage
    return loadBestModelFromLocalStorage();
  }
};

/**
 * Load best model from localStorage
 */
const loadBestModelFromLocalStorage = (): NeuralNetworkModel | null => {
  try {
    const storedModel = localStorage.getItem(LOCAL_STORAGE_KEY_BEST_MODEL);
    if (!storedModel) {
      console.log('No model found in localStorage');
      return null;
    }
    
    return JSON.parse(storedModel) as NeuralNetworkModel;
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return null;
  }
};

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
      // Fix: Only use properties defined in NeuralNetworkModel type
      const model: NeuralNetworkModel = {
        id: modelId,
        weights: weights,
        score: score,
        generation: generation,
        metadata: metadata
      };
      
      // Save in all models collection
      const allModels = loadAllModelsFromLocalStorage();
      const existingModelIndex = allModels.findIndex(m => m.id === modelId);
      
      if (existingModelIndex >= 0) {
        allModels[existingModelIndex] = model;
      } else {
        allModels.push(model);
      }
      
      // Sort by score descending
      allModels.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY_ALL_MODELS, JSON.stringify(allModels));
      
      // Update best model if this is now the best
      const bestModel = loadBestModelFromLocalStorage();
      if (!bestModel || (bestModel.score || 0) < score) {
        localStorage.setItem(LOCAL_STORAGE_KEY_BEST_MODEL, JSON.stringify(model));
      }
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
 * Generate a client-side ID when database is unavailable
 */
const generateClientId = (): string => {
  return 'client-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Load all models from localStorage
 */
const loadAllModelsFromLocalStorage = (): NeuralNetworkModel[] => {
  try {
    const storedModels = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_MODELS);
    if (!storedModels) {
      return [];
    }
    
    return JSON.parse(storedModels) as NeuralNetworkModel[];
  } catch (err) {
    console.error('Error loading all models from localStorage:', err);
    return [];
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

/**
 * Fetches all neural network models from the database
 * Falls back to localStorage if database connection fails
 */
export const fetchAllModelsFromDb = async (): Promise<NeuralNetworkModel[]> => {
  try {
    // First try from Supabase
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) {
      console.error('Error loading all neural networks from DB:', error);
      // Fall back to localStorage
      return loadAllModelsFromLocalStorage();
    }
    
    if (!data || data.length === 0) {
      console.log('No models found in database, checking localStorage');
      return loadAllModelsFromLocalStorage();
    }
    
    // Cache in localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ALL_MODELS, JSON.stringify(data));
    } catch (storageErr) {
      console.warn('Failed to cache all models to localStorage:', storageErr);
    }
    
    return data as NeuralNetworkModel[];
  } catch (err) {
    console.error('Exception loading all neural networks from DB:', err);
    // Fall back to localStorage
    return loadAllModelsFromLocalStorage();
  }
};
