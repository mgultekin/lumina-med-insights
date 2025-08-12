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
      analysis_result, 
      report_text, 
      title, 
      template_key, 
      tone, 
      keywords, 
      citations, 
      use_report, 
      use_analysis 
    } = await req.json()

    console.log('Received article generation request:', { 
      analysis_id, 
      title, 
      template_key, 
      tone, 
      keywords, 
      citations 
    })

    // Call external webhook
    const webhookUrl = Deno.env.get('GENERATE_ARTICLE_WEBHOOK_URL')
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
        analysis_result,
        report_text,
        title,
        template_key,
        tone,
        keywords,
        citations,
        use_report,
        use_analysis
      })
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`)
    }

    const result = await webhookResponse.json()
    
    // Update analysis with article
    await supabaseClient
      .from('analyses')
      .update({ 
        status: 'article_draft',
        article_text: result.article_text || `# Medical Analysis Article

## Abstract
This article presents findings from AI-powered medical image analysis.

## Introduction
Comprehensive analysis of medical imaging data using advanced AI algorithms.

## Methods
AI-powered analysis was performed on the submitted medical image.

## Results
${analysis_result}

## Discussion
The findings suggest further clinical correlation may be warranted.

## Conclusion
AI analysis completed successfully with actionable insights.`
      })
      .eq('id', analysis_id)

    console.log('Article generation completed successfully')

    return new Response(
      JSON.stringify({ success: true, article_text: result.article_text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in generate-article:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})