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

    const { 
      analysis_id, 
      article_text, 
      article_title, 
      tone, 
      keywords, 
      citations 
    } = await req.json()

    console.log('Received article publish request:', { analysis_id, article_title })

    // Call external webhook
    const webhookUrl = Deno.env.get('PUBLISH_ARTICLE_WEBHOOK_URL')
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
        article_text,
        article_title,
        tone,
        keywords,
        citations
      })
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`)
    }

    const result = await webhookResponse.json()
    
    // Update analysis with published URL and status
    await supabaseClient
      .from('analyses')
      .update({ 
        status: 'published',
        published_url: result.published_url || `https://example.com/articles/${analysis_id}`
      })
      .eq('id', analysis_id)

    console.log('Article published successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        published_url: result.published_url || `https://example.com/articles/${analysis_id}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in publish-article:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})