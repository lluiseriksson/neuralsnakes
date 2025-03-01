
import { supabase } from "@/integrations/supabase/client";

// Function to save training data to Supabase
export const saveTrainingData = async (inputs: number[], outputs: number[], success: boolean) => {
  try {
    const { error } = await supabase.from('training_data').insert({
      inputs: inputs,
      outputs: outputs,
      success: success,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving training data:', error);
    }
  } catch (err) {
    console.error('Error in saveTrainingData:', err);
  }
};

// Function to fetch the best neural network model from Supabase
export const fetchBestModel = async (): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching best model:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in fetchBestModel:', err);
    return null;
  }
};

// Function to save a trained neural network model to Supabase
export const saveModel = async (model: number[], score: number) => {
  try {
    const { error } = await supabase.from('neural_networks').insert({
      weights: model,
      score: score,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving model:', error);
    }
  } catch (err) {
    console.error('Error in saveModel:', err);
  }
};

// Function to call the sync-models edge function
export const syncModels = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-models');
    
    if (error) {
      console.error('Error syncing models:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error calling sync-models function:', err);
    return null;
  }
};
