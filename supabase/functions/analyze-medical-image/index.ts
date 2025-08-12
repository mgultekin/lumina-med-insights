import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { analysis_id, user_id, image_paths, modality, body_region, notes, template } = await req.json()

    console.log('Received analysis request:', { analysis_id, user_id, modality, body_region, template, image_count: image_paths?.length })

    // Update status to analyzing
    await supabaseClient
      .from('analyses')
      .update({ status: 'analyzing' })
      .eq('id', analysis_id)

    // Call external webhook
    const webhookUrl = Deno.env.get('ANALYZE_WEBHOOK_URL')
    const authToken = Deno.env.get('WEBHOOK_AUTH_TOKEN')

    if (!webhookUrl || !authToken) {
      throw new Error('Webhook configuration missing')
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        analysis_id,
        user_id,
        image_paths,
        modality,
        body_region,
        notes,
        template
      })
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`)
    }

    const result = await webhookResponse.json()
    
    // Update analysis with results
    await supabaseClient
      .from('analyses')
      .update({ 
        status: 'analyzed',
        analysis_result: result.analysis_result || 'Analysis completed successfully'
      })
      .eq('id', analysis_id)

    console.log('Analysis completed successfully')

    return new Response(
      JSON.stringify({ success: true, analysis_result: result.analysis_result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in analyze-medical-image:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})