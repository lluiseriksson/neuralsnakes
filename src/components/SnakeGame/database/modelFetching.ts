
import { supabase } from "@/integrations/supabase/client";
import { NeuralNetworkModel } from "../types";
import { loadBestModelFromLocalStorage, loadAllModelsFromLocalStorage } from "./localStorageUtils";
import { LOCAL_STORAGE_KEY_ALL_MODELS, LOCAL_STORAGE_KEY_BEST_MODEL } from "./config";

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
    
    // Convert to NeuralNetworkModel format
    const rawModel = data[0];
    const best_score = rawModel.metadata?.best_score || rawModel.score || 0;
    const games_played = rawModel.metadata?.games_played || 0;
    
    const model: NeuralNetworkModel = {
      id: rawModel.id,
      weights: rawModel.weights as unknown as number[],
      score: rawModel.score,
      generation: rawModel.generation,
      created_at: rawModel.created_at,
      updated_at: rawModel.updated_at,
      best_score: best_score,
      games_played: games_played,
      metadata: rawModel.metadata
    };
    
    // Update localStorage cache
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BEST_MODEL, JSON.stringify(model));
    } catch (storageErr) {
      console.warn('Failed to cache best model to localStorage:', storageErr);
    }
    
    return model;
  } catch (err) {
    console.error('Exception loading best neural network from DB:', err);
    // Fall back to localStorage
    return loadBestModelFromLocalStorage();
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
    
    // Convert to NeuralNetworkModel format
    const models: NeuralNetworkModel[] = data.map(rawModel => {
      const best_score = rawModel.metadata?.best_score || rawModel.score || 0;
      const games_played = rawModel.metadata?.games_played || 0;
      
      return {
        id: rawModel.id,
        weights: rawModel.weights as unknown as number[],
        score: rawModel.score,
        generation: rawModel.generation,
        created_at: rawModel.created_at,
        updated_at: rawModel.updated_at,
        best_score: best_score,
        games_played: games_played,
        metadata: rawModel.metadata
      };
    });
    
    // Cache in localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ALL_MODELS, JSON.stringify(models));
    } catch (storageErr) {
      console.warn('Failed to cache all models to localStorage:', storageErr);
    }
    
    return models;
  } catch (err) {
    console.error('Exception loading all neural networks from DB:', err);
    // Fall back to localStorage
    return loadAllModelsFromLocalStorage();
  }
};
