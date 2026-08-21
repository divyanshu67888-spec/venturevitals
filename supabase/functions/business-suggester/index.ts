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
    const { budget, location, interests } = await req.json();
    if (!budget || !location) {
      return new Response(JSON.stringify({ error: 'budget and location are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    const systemPrompt = `You are an AI-powered business consultant integrated into a market validation platform.
Your job is to suggest realistic, highly profitable business ideas based on a user's budget and location tier.

Respond with ONLY valid JSON (no markdown, no extra text) matching this exact structure:
{
  "budgetInsight": "<2-3 sentences explaining what this budget level can realistically achieve>",
  "topAdvice": "<1 sentence of killer advice for someone starting with this budget>",
  "suggestions": [
    {
      "rank": <number 1 to 5>,
      "businessName": "<Catchy but clear business title>",
      "category": "<e.g., E-commerce, Local Service, SaaS>",
      "tagline": "<1 short sentence tagline>",
      "whyThisBusiness": "<2-3 sentences explaining why it fits this budget and location>",
      "estimatedInvestment": "<₹ range>",
      "expectedMonthlyProfit": "<₹ range>",
      "breakEvenMonths": "<e.g. 3-6 months>",
      "difficultyLevel": "Easy" | "Medium" | "Hard",
      "keyRequirements": ["<req 1>", "<req 2>"],
      "riskLevel": "Low" | "Medium" | "High",
      "growthPotential": "Low" | "Medium" | "High",
      "quickTips": ["<tip 1>", "<tip 2>"]
    }
  ]
}

Guidelines:
- Suggest exactly 5 distinct business ideas.
- Ensure the ideas realistically match the provided budget (in ₹ INR).
- Adjust the viability based on the location (Tier 1 vs Tier 2/3).
- If 'interests' are provided, try to align at least 2-3 suggestions with those interests.
- Be highly practical, actionable, and focus on high-ROI Indian startup models.
- **DO NOT** suggest businesses that require 10x the inputted budget.`;

    const userPrompt = `Budget: ₹${budget}\nLocation: ${location}\nInterests/Skills: ${interests || 'None specified'}\n\nGenerate realistic business suggestions fitting these constraints.`;

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
          { role: 'user', content: userPrompt },
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
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    console.log('AI response received, length:', content.length);

    let result;
    try {
      // Improved regex to handle markdown code blocks and whitespace
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        // Clean up common AI artifacts like markdown backticks if they were caught
        let jsonStr = jsonMatch[0].trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
        
        result = JSON.parse(jsonStr.trim());
      } else {
        console.error('No JSON found in content:', content);
        throw new Error('No JSON found in AI response');
      }
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse business suggestions: ' + (parseErr instanceof Error ? parseErr.message : 'Invalid JSON'));
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error('business-suggester error:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
