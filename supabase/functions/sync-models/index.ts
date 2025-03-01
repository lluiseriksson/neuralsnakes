
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch top performing models
    const { data: topModels, error: fetchError } = await supabase
      .from('neural_networks')
      .select('*')
      .order('score', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('Error fetching top models:', fetchError)
      return new Response(JSON.stringify({ error: 'Error fetching models' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!topModels || topModels.length === 0) {
      return new Response(JSON.stringify({ message: 'No models found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Combine the top models
    // If we have multiple models, we could implement a more sophisticated
    // combination algorithm here (like averaging weights or ensemble methods)
    const bestModel = topModels[0]
    
    console.log(`Synced models successfully. Best model has score: ${bestModel.score}`)

    return new Response(JSON.stringify({ 
      message: 'Models synced successfully',
      bestModel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in sync-models function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
