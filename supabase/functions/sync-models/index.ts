
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Si se está enviando un nuevo modelo
    if (req.method === 'POST') {
      const { model, score } = await req.json();
      
      if (!model || !model.weights) {
        return new Response(
          JSON.stringify({ error: 'Invalid model data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Guardar el modelo en la base de datos
      const { data, error } = await supabase
        .from('neural_networks')
        .insert({
          weights: model.weights,
          score: score || 0,
          generation: model.generation || 1,
          metadata: model.metadata || {}
        })
        .select('id');

      if (error) {
        console.error('Error saving model:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save model' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, id: data[0].id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Si se está solicitando modelos combinados
    else if (req.method === 'GET') {
      const { count } = await req.json();
      const limit = count ? parseInt(count) : 5;

      // Obtener los mejores modelos
      const { data, error } = await supabase
        .from('neural_networks')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error loading models:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to load models' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Si no hay suficientes modelos, devolver los que hay
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ models: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calcular el modelo combinado
      const weightsLength = data[0].weights.length;
      const combinedWeights = new Array(weightsLength).fill(0);
      
      let totalScore = data.reduce((sum, model) => sum + model.score, 0);
      if (totalScore === 0) totalScore = data.length; // Evitar división por cero
      
      for (const model of data) {
        const influence = model.score / totalScore;
        
        for (let i = 0; i < weightsLength; i++) {
          combinedWeights[i] += model.weights[i] * influence;
        }
      }

      // Añadir mutación aleatoria para exploración
      const mutatedWeights = combinedWeights.map(w => {
        if (Math.random() < 0.1) {
          return w + (Math.random() * 0.2 - 0.1);
        }
        return w;
      });

      // Determinar la nueva generación
      const newGeneration = Math.max(...data.map(model => model.generation || 1)) + 1;

      // Guardar el nuevo modelo combinado
      const { data: newModelData, error: newModelError } = await supabase
        .from('neural_networks')
        .insert({
          weights: mutatedWeights,
          score: 0,
          generation: newGeneration,
          metadata: { source: 'combined', parentModels: data.map(m => m.id) }
        })
        .select('id');

      if (newModelError) {
        console.error('Error saving combined model:', newModelError);
      }

      // Devolver los modelos originales y el combinado
      return new Response(
        JSON.stringify({ 
          models: data,
          combinedModel: {
            id: newModelData?.[0]?.id,
            weights: mutatedWeights,
            generation: newGeneration,
            score: 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Error in sync-models function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
