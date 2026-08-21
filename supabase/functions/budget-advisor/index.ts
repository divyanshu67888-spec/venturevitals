// @ts-nocheck — Deno runtime file, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, location, budgetPreference } = await req.json();
    if (!businessName || !location || !budgetPreference) {
      return new Response(JSON.stringify({ error: 'businessName, location, and budgetPreference are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    // === RAG: Fetch relevant knowledge base context ===
    let ragContext = '';
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
      const ragQuery = `${businessName} ${location} ${budgetPreference} budget cost India startup`;
      const ragRes = await fetch(`${SUPABASE_URL}/functions/v1/rag-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ query: ragQuery, match_count: 5 }),
      });
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        if (ragData.context) {
          ragContext = `\n=== KNOWLEDGE BASE CONTEXT (use this curated data to ground cost estimates) ===\n${ragData.context}\n=== END KNOWLEDGE BASE ===\n`;
          console.log('RAG context retrieved:', ragData.chunks?.length, 'chunks');
        }
      }
    } catch (ragErr) {
      console.warn('RAG search failed (non-fatal):', ragErr);
    }

    const systemPrompt = `You are an AI-powered business consultant integrated inside a market validation platform.
Your job is to generate a complete, structured, and realistic business cost analysis based on user input.

Respond with ONLY valid JSON (no markdown, no extra text) matching this exact structure:
{
  "businessOverview": {
    "description": "<2-3 sentences explaining the business>",
    "targetCustomers": "<who are the ideal customers>",
    "businessModel": "<how the business makes money>"
  },
  "costBreakdown": {
    "initialSetupCosts": [
      { "item": "<e.g. Rent / Space Setup>", "amount": "<₹ amount>", "note": "<brief note>" }
    ],
    "monthlyRecurringCosts": [
      { "item": "<e.g. Rent>", "amount": "<₹ amount/month>", "note": "<brief note>" }
    ],
    "totalInitialCost": "<₹ total>",
    "totalMonthlyCost": "<₹ total>"
  },
  "budgetScenarios": {
    "low": {
      "range": "<₹ range>",
      "includes": ["<what's included>"],
      "tradeoffs": "<what you sacrifice>"
    },
    "medium": {
      "range": "<₹ range>",
      "includes": ["<improvements over low>"],
      "tradeoffs": "<balanced approach>"
    },
    "high": {
      "range": "<₹ range>",
      "includes": ["<premium features>"],
      "tradeoffs": "<maximum quality>"
    }
  },
  "locationAdjustment": {
    "tier1": { "label": "Tier 1 (Delhi, Mumbai, Bangalore)", "costMultiplier": "<e.g. 1.5x-2x>", "keyDifferences": ["<differences>"] },
    "tier2": { "label": "Tier 2 Cities", "costMultiplier": "<e.g. 1x-1.3x>", "keyDifferences": ["<differences>"] },
    "tier3": { "label": "Tier 3 Cities", "costMultiplier": "<e.g. 0.5x-0.8x>", "keyDifferences": ["<differences>"] }
  },
  "hiddenCosts": [
    { "item": "<e.g. Legal & Compliance>", "estimated": "<₹ amount>", "note": "<why it's important>" }
  ],
  "investmentSummary": {
    "minimumInvestment": "<₹ amount>",
    "recommendedInvestment": "<₹ amount>",
    "breakdownSummary": "<short summary>"
  },
  "profitEstimation": {
    "expectedMonthlyRevenue": "<₹ range>",
    "monthlyExpenses": "<₹ range>",
    "expectedProfitRange": "<₹ range>",
    "breakEvenMonths": "<e.g. 6-9 months>"
  },
  "smartInsights": {
    "costSavingStrategies": ["<practical tip>"],
    "commonMistakes": ["<mistake beginners make>"],
    "spendMoreOn": ["<where to invest more>"],
    "saveOn": ["<where to cut costs>"]
  },
  "growthPlan": {
    "sixToTwelveMonths": ["<expansion step>"],
    "revenueGrowthIdeas": ["<revenue idea>"],
    "scalingIdeas": ["<online/offline scaling idea>"]
  }
}

Guidelines:
- Use ₹ INR currency ONLY
- Customize everything based on the specific business type, NOT generic advice
- Adjust all costs based on the location tier
- Be realistic and actionable for Indian users
- Keep it startup-friendly and practical
- Avoid vague ranges — be specific with numbers
${ragContext ? '\nIMPORTANT: Use the KNOWLEDGE BASE CONTEXT provided above to anchor your cost estimates and market insights.' : ''}`;

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
          { role: 'user', content: `Business Idea: ${businessName}\nLocation: ${location}\nBudget Preference: ${budgetPreference}\n${ragContext}\nGenerate a complete business cost analysis.` },
        ],
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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits in Settings.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    console.log('AI response received, length:', content.length);

    let result;
    try {
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0].trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
        result = JSON.parse(jsonStr.trim());
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse analysis report: ' + (parseErr instanceof Error ? parseErr.message : 'Invalid JSON'));
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error('budget-advisor error:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
