// @ts-nocheck — Deno runtime file, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ───── World Bank API Helpers ─────
const WB_BASE = "https://api.worldbank.org/v2";

interface WBDataPoint {
  year: number;
  value: number | null;
  indicator: string;
  indicatorId: string;
}

async function fetchWorldBankIndicator(
  countryCode: string,
  indicatorId: string,
  startYear = 2015,
  endYear = 2024
): Promise<WBDataPoint[]> {
  try {
    const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorId}?format=json&date=${startYear}:${endYear}&per_page=100`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return [];
    return json[1]
      .map((d: any) => ({
        year: parseInt(d.date, 10),
        value: d.value,
        indicator: d.indicator?.value ?? '',
        indicatorId: d.indicator?.id ?? indicatorId,
      }))
      .filter((d: WBDataPoint) => d.value !== null)
      .sort((a: WBDataPoint, b: WBDataPoint) => a.year - b.year);
  } catch (e) {
    console.error(`World Bank fetch failed for ${indicatorId}:`, e);
    return [];
  }
}

/** Fetch a bundle of key economic indicators for a country */
async function fetchEconomicData(countryCode = 'IN') {
  const indicators = [
    { id: 'NY.GDP.MKTP.CD', label: 'GDP (Current USD)' },
    { id: 'NY.GDP.MKTP.KD.ZG', label: 'GDP Growth Rate (%)' },
    { id: 'FP.CPI.TOTL.ZG', label: 'Inflation Rate - CPI (%)' },
    { id: 'FP.CPI.TOTL', label: 'Consumer Price Index (2010=100)' },
    { id: 'FR.INR.LEND', label: 'Lending Interest Rate (%)' },
    { id: 'PA.NUS.FCRF', label: 'Exchange Rate (LCU per USD)' },
  ];

  const results = await Promise.allSettled(
    indicators.map((ind) => fetchWorldBankIndicator(countryCode, ind.id))
  );

  const data: Record<string, { label: string; data: WBDataPoint[] }> = {};
  indicators.forEach((ind, i) => {
    data[ind.id] = {
      label: ind.label,
      data: results[i].status === 'fulfilled' ? results[i].value : [],
    };
  });
  return data;
}

function formatEconomicContext(
  econ: Record<string, { label: string; data: WBDataPoint[] }>,
  countryName: string
): string {
  let ctx = `\n=== WORLD BANK ECONOMIC DATA (${countryName}) ===\n`;
  ctx += `Source: World Bank Open Data API — verified government statistics\n\n`;

  for (const [id, entry] of Object.entries(econ)) {
    if (entry.data.length === 0) continue;
    ctx += `📊 ${entry.label}:\n`;
    const recent = entry.data.slice(-5); // last 5 years
    for (const pt of recent) {
      let formatted: string;
      if (id === 'NY.GDP.MKTP.CD') {
        formatted = `$${(pt.value! / 1e12).toFixed(3)} Trillion`;
      } else if (id.includes('ZG') || id.includes('LEND') || id.includes('RINR')) {
        formatted = `${pt.value!.toFixed(2)}%`;
      } else {
        formatted = pt.value!.toLocaleString();
      }
      ctx += `  ${pt.year}: ${formatted}\n`;
    }
    // YoY change
    if (entry.data.length >= 2) {
      const latest = entry.data[entry.data.length - 1];
      const prev = entry.data[entry.data.length - 2];
      if (latest.value && prev.value && prev.value !== 0) {
        const change = ((latest.value - prev.value) / Math.abs(prev.value) * 100);
        ctx += `  ↳ YoY Change: ${change > 0 ? '+' : ''}${change.toFixed(2)}% (${prev.year}→${latest.year})\n`;
      }
    }
    ctx += `\n`;
  }
  ctx += `=== END WORLD BANK DATA ===\n`;
  return ctx;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function searchWeb(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });
    const data = await response.json();
    const results = data?.data || [];
    return results.map((r: any) => `[${r.title}](${r.url})\n${(r.markdown || r.description || '').slice(0, 500)}`).join('\n\n---\n\n');
  } catch (e) {
    console.error('Search error:', e);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, mode = 'research' } = await req.json();
    if (!idea) {
      return new Response(JSON.stringify({ error: 'Idea is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isBusinessMode = mode === 'business';

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

    // === RAG: Fetch relevant knowledge base context ===
    let ragContext = '';
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
      const ragRes = await fetch(`${SUPABASE_URL}/functions/v1/rag-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ query: idea, match_count: 5 }),
      });
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        if (ragData.context) {
          ragContext = `\n=== KNOWLEDGE BASE CONTEXT (use this data to ground your analysis) ===\n${ragData.context}\n=== END KNOWLEDGE BASE ===\n`;
          console.log('RAG context retrieved:', ragData.chunks?.length, 'chunks');
        }
      }
    } catch (ragErr) {
      console.warn('RAG search failed (non-fatal):', ragErr);
    }

    let liveContext = '';
    if (FIRECRAWL_API_KEY) {
      console.log('Firecrawl available — gathering live web data...');
      const [marketData, academicData, trendData, industryData] = await Promise.all([
        searchWeb(`${idea} market size TAM growth statistics 2024 2025`, FIRECRAWL_API_KEY),
        searchWeb(`${idea} research papers academic studies evidence`, FIRECRAWL_API_KEY),
        searchWeb(`${idea} trends innovation adoption rate demand signals`, FIRECRAWL_API_KEY),
        searchWeb(`${idea} industry report competitors SWOT analysis risks`, FIRECRAWL_API_KEY),
      ]);

      liveContext = `
=== LIVE WEB INTELLIGENCE ===
--- Market & Quantitative Data ---
${marketData || 'No data found'}
--- Academic & Research Evidence ---
${academicData || 'No data found'}
--- Trends & Innovation Signals ---
${trendData || 'No data found'}
--- Industry & Competitive Intelligence ---
${industryData || 'No data found'}
=== END LIVE DATA ===
`;
      console.log('Live web data gathered successfully');
    }

    // === WORLD BANK: Fetch precise economic data (research mode) ===
    let worldBankContext = '';
    let worldBankRawData: Record<string, { label: string; data: WBDataPoint[] }> | null = null;
    if (!isBusinessMode) {
      try {
        console.log('Fetching World Bank economic data for research mode...');
        worldBankRawData = await fetchEconomicData('IN');
        worldBankContext = formatEconomicContext(worldBankRawData, 'India');
        console.log('World Bank data fetched successfully');
      } catch (wbErr) {
        console.warn('World Bank fetch failed (non-fatal):', wbErr);
      }
    }

    const modeInstructions = isBusinessMode
      ? `You are an expert Startup Advisor and human mentor. You evaluate business ideas using 4 key perspectives, but your writing MUST completely avoid robotic, dry, or academic phrasing. Speak directly to the founder in a warm, conversational, empathetic, and constructive tone—like an experienced investor giving feedback over coffee. Keep your language accessible and human.`
      : `You are an expert Research Mentor. You evaluate research ideas using 4 key perspectives, but your writing MUST completely avoid robotic or overly academic phrasing. Speak directly to the user in a warm, conversational, and genuinely helpful tone. Keep your language accessible, human, and naturally flowing.
IMPORTANT: You have access to PRECISE World Bank economic data below. Use these exact numbers in your analysis — cite GDP growth rates, inflation figures, interest rates, and exchange rates with their actual values from the data. Do NOT make up economic numbers when real data is provided.`;

    const systemPrompt = `${modeInstructions}

${ragContext ? 'IMPORTANT: You have access to a curated knowledge base below. Prioritize this data in your analysis.' : ''}
${ragContext}
${worldBankContext}
${liveContext ? 'Use the LIVE WEB DATA below for grounded analysis with real numbers, sources, and evidence.' : 'Use your training knowledge. Be specific with realistic estimates and data points.'}

Respond with ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "score": <number 0-100>,
  "confidenceLevel": "Low" | "Moderate" | "High",
  "verdict": "<one-line executive summary>",

  "step1_statisticalSkeptic": {
    "statisticalSignals": "<2-3 sentences on current quantitative trends>",
    "quantitativeTrends": "<2-3 sentences on market/academic demand signals & adoption rates>",
    "riskIndicators": "<2-3 sentences on data-backed risks>",
    "dataGaps": "<2-3 sentences on missing numerical evidence>",
    "sentiment": "positive" | "warning" | "neutral"
  },

  "step2_theorySpecialist": {
    "theoreticalContext": "<2-3 sentences on relevant theories (SWOT, Porter's, innovation frameworks)>",
    "strategicEvaluation": "<2-3 sentences>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "conceptualGaps": "<2-3 sentences>",
    "sentiment": "positive" | "warning" | "neutral"
  },

  "step3_methodologyCritic": {
    "assumptionsIdentified": ["<assumption 1>", "<assumption 2>", "<assumption 3>"],
    "methodologicalRisks": "<2-3 sentences>",
    "biasAnalysis": "<2-3 sentences on bias risks>",
    "feasibilityConcerns": "<2-3 sentences on scalability, ethics, data collection>",
    "sentiment": "positive" | "warning" | "neutral"
  },

  "step4_finalReport": {
    "executiveSummary": "<3-4 sentence synthesis>",
    "crossAgentInsights": ["<insight 1>", "<insight 2>", "<insight 3>", "<insight 4>"],
    "majorRisks": ["<risk 1>", "<risk 2>", "<risk 3>"],
    "opportunitySignals": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
    "pertChartMermaid": "graph TD\\n  A[Phase 1] --> B[Phase 2]\\n  B --> C[Launch]"
  },

  "step5_sources": {
    "sourceTypes": [
      { "type": "News", "relevance": "high" | "medium" | "low", "note": "<what was found>" },
      { "type": "Academic Papers", "relevance": "high" | "medium" | "low", "note": "<what was found>" },
      { "type": "Industry Reports", "relevance": "high" | "medium" | "low", "note": "<what was found>" },
      { "type": "Government Data", "relevance": "high" | "medium" | "low", "note": "<what was found>" },
      { "type": "Market Trend Analysis", "relevance": "high" | "medium" | "low", "note": "<what was found>" }
    ]
  },

  "marketMetrics": {
    "tam": "<total addressable market e.g. $50B>",
    "sam": "<serviceable addressable market e.g. $12B>",
    "som": "<serviceable obtainable market e.g. $500M>",
    "cagr": "<compound annual growth rate e.g. 18%>",
    "yearOverYear": [
      { "year": "2022", "value": <number in billions> },
      { "year": "2023", "value": <number in billions> },
      { "year": "2024", "value": <number in billions> },
      { "year": "2025", "value": <number in billions> },
      { "year": "2026", "value": <number in billions> }
    ]
  },

  "dimensionScores": [
    { "dimension": "Market Viability", "score": <0-100> },
    { "dimension": "Evidence Strength", "score": <0-100> },
    { "dimension": "Methodology", "score": <0-100> },
    { "dimension": "Feasibility", "score": <0-100> },
    { "dimension": "Scalability", "score": <0-100> },
    { "dimension": "Innovation", "score": <0-100> }
  ],

  "competitors": [
    { "name": "<competitor>", "marketShare": <0-100>, "strength": "<key strength>", "weakness": "<key weakness>" }
  ],

  "improvements": [
    { "title": "<short title>", "description": "<1-2 sentences>", "impact": "high" | "medium" | "low", "type": "core" | "outOfBox" }
  ],

  "economicData": {
    "country": "<country name>",
    "gdpCurrent": "<latest GDP in readable format e.g. $3.73 Trillion>",
    "gdpGrowthRate": "<latest GDP growth e.g. 7.24%>",
    "inflationRate": "<latest CPI inflation e.g. 5.66%>",
    "lendingRate": "<latest lending interest rate e.g. 9.35%>",
    "exchangeRate": "<latest LCU per USD e.g. ₹83.39>",
    "economicOutlook": "<2-3 sentences summarizing the economic environment and what it means for this idea>",
    "keyInsights": [
      "<insight about how GDP/growth affects this idea>",
      "<insight about how inflation/prices affect this idea>",
      "<insight about interest rates and funding environment>"
    ],
    "yearlyTrends": [
      { "year": "<year>", "gdpGrowth": <number>, "inflation": <number>, "lendingRate": <number> }
    ]
  }
}

Scoring Logic:
- Strong live data + human validation → higher score
- Weak evidence or high assumptions → lower score
- High feasibility + strong demand → higher score
- Major methodological flaws → reduce score

For "competitors", include 4-6 real or realistic competitors.
CRITICAL: Write naturally! Do not use robotic jargon. Speak like a supportive human expert analyzing an idea. Use grounded, specific data relevant to the Indian market. Be constructive, empathetic, and honest.
For "improvements", include 6-8 ideas — mix of "core" and "outOfBox".
For "economicData", use the EXACT numbers from the World Bank data provided. Include the last 5 years in yearlyTrends.
Write the final report exactly how a friendly human mentor would speak to a founder.`;

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
          { role: 'user', content: `Analyze this ${isBusinessMode ? 'business idea' : 'research idea'}: ${idea}\n\n${liveContext}` },
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

    let report;
    try {
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0].trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
        report = JSON.parse(jsonStr.trim());
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse validation report: ' + (parseErr instanceof Error ? parseErr.message : 'Invalid JSON'));
    }

    // Attach raw World Bank data to the response for frontend charting
    if (worldBankRawData) {
      report._worldBankRaw = {};
      for (const [id, entry] of Object.entries(worldBankRawData)) {
        if (entry.data.length > 0) {
          report._worldBankRaw[id] = {
            label: entry.label,
            data: entry.data.map((d: WBDataPoint) => ({ year: d.year, value: d.value })),
          };
        }
      }
    }

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error('war-room error:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
