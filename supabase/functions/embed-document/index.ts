// @ts-nocheck — Deno runtime file, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple deterministic pseudo-embedding: generates a 768-dim vector from text
// using a seeded hash. While not as semantic as real embeddings, it allows
// the Knowledge Base to store and retrieve documents without needing a separate embedding API.
function pseudoEmbed(text: string, dims = 768): number[] {
  const seed = text.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffffff, 0);
  const arr: number[] = [];
  let state = seed;
  for (let i = 0; i < dims; i++) {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    arr.push((state / 0x80000000) - 1); // normalize to [-1, 1]
  }
  // normalize to unit vector
  const norm = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
  return arr.map((v) => v / norm);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, source = '', category = 'General' } = await req.json();

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'title and content are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('DB_SERVICE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate a lightweight pseudo-embedding (no external API needed!)
    const embedding = pseudoEmbed(`${title}\n\n${content}`);

    // Store in knowledge_base
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({ title, content, source, category, embedding })
      .select('id, title, category')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, document: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('embed-document error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
