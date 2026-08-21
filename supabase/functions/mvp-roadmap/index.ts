// @ts-nocheck — Deno runtime file, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const businessIdea = body.businessIdea || body.idea;
    const timeline = body.timeline || "3 Months";

    if (!businessIdea) {
      return new Response(
        JSON.stringify({ error: 'Business idea is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    // === RAG: Fetch relevant knowledge base context ===
    let ragContext = '';
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
      const ragQuery = `${businessIdea} roadmap tech stack MVP timeline India`;
      const ragRes = await fetch(`${SUPABASE_URL}/functions/v1/rag-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: ragQuery, match_count: 2 })
      });
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        if (ragData.context) {
          ragContext = `\n\n=== KNOWLEDGE BASE CONTEXT ===\n${ragData.context}\n===============================`;
        }
      }
    } catch (e) {
      console.warn("RAG search failed, continuing without context", e);
    }

    const systemPrompt = `You are an expert Chief Technology Officer (CTO) and Product Manager.
Your job is to create an extreme highly structured MVP (Minimum Viable Product) and Go-To-Market roadmap based on the user's business idea.

You must output ONLY raw, valid JSON. Absolutely no markdown formatting like \`\`\`json. DO NOT wrap the output in any formatting.
Ensure keys and string values are in double quotes.
The JSON must strictly conform to this TypeScript schema:

interface RoadmapTask {
  task: string;
  duration: string;
  priority: "critical" | "high" | "medium";
}

interface RoadmapPhase {
  phase: number;
  name: string;
  weeks: string;
  goal: string;
  tasks: RoadmapTask[];
  deliverables: string[];
  milestone: string;
}

interface KeyMetric {
  metric: string;
  target: string;
  timeframe: string;
}

interface RoadmapRisk {
  risk: string;
  mitigation: string;
}

interface MVPRoadmap {
  title: string;
  tagline: string;
  techStack: string[];
  phases: RoadmapPhase[];
  keyMetrics: KeyMetric[];
  estimatedCost: {
    low: string;
    medium: string;
    high: string;
  };
  risks: RoadmapRisk[];
  launchChecklist: string[];
}

Guidelines:
- Create 3 to 4 logical phases (e.g. Setup, Build, Test, Launch). Total time should align roughly with the ${timeline || '3 months'} timeline.
- Tech Stack should list 4-6 specific technologies (e.g., "Next.js", "Supabase", "Tailwind CSS", "Stripe").
- Give realistic costs in INR (e.g., "₹50,000", "₹1,50,000", "₹3,00,000").
- Use realistic Indian market context where applicable.
${ragContext ? '\nIMPORTANT: Use the KNOWLEDGE BASE CONTEXT provided above to anchor your recommendations.' : ''}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Business Idea: ${businessIdea}\nTimeline: ${timeline || '3 months'}\n${ragContext}\nGenerate the MVP Roadmap JSON.` },
        ],
        temperature: 0.2, // Low temp for structured data JSON output
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Unauthorized. Check if your GROQ_API_KEY is correct. Hint: This code is for Groq Cloud (console.groq.com), not xAI Grok (console.x.ai).' 
        }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'AI service is currently busy (Rate Limit). Please try again in a few seconds.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway Error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || "";
    
    console.log('AI response received, length:', content.length);

    // Robust parsing: extract JSON from possible markdown wrap
    try {
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0].trim();
        // Strip markdown backticks if AI decided to include them
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
        
        const parsed = JSON.parse(jsonStr.trim());
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error('No JSON structure found in AI response.');
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", content);
      throw new Error('AI returned invalid JSON structure: ' + (parseError instanceof Error ? parseError.message : 'Parse error'));
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in mvp-roadmap:', errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
