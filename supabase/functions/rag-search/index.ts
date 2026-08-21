// @ts-nocheck — Deno runtime file, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, match_count = 5, match_threshold = 0.4 } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Embed the query
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: query }] },
        }),
      }
    );

    if (!embedRes.ok) {
      const err = await embedRes.text();
      console.error('Embedding error:', err);
      // Return empty results gracefully — don't break the AI call
      return new Response(JSON.stringify({ chunks: [], context: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const embedData = await embedRes.json();
    const embedding = embedData.embedding?.values;
    if (!embedding) {
      return new Response(JSON.stringify({ chunks: [], context: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search knowledge base
    const { data: chunks, error } = await supabase.rpc('match_knowledge', {
      query_embedding: embedding,
      match_count,
      match_threshold,
    });

    if (error) {
      console.error('RAG search error:', error);
      return new Response(JSON.stringify({ chunks: [], context: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format as context string for AI prompt injection
    const context = chunks && chunks.length > 0
      ? chunks
          .map((c: any) => `[${c.category}] ${c.title}:\n${c.content}`)
          .join('\n\n---\n\n')
      : '';

    return new Response(JSON.stringify({ chunks: chunks || [], context }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('rag-search error:', e);
    // Graceful fallback — never break the main AI flow
    return new Response(JSON.stringify({ chunks: [], context: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
