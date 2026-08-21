import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, report, idea } = await req.json();

    if (!email || !report || !idea) {
      console.error("Validation Error: Missing required fields (email, report, idea). Request JSON:", { email, idea });
      return new Response(
        JSON.stringify({ error: "Failed: Missing required parameters." }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service is not configured (Missing Resend Secret)" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the email using HTML mapping of the report
    const executiveSummary = report.step4_finalReport?.executiveSummary || "N/A";
    const majorRisks = report.step4_finalReport?.majorRisks?.map((r: string) => `<li>${r}</li>`).join("") || "<li>None</li>";
    const opportunities = report.step4_finalReport?.opportunitySignals?.map((o: string) => `<li>${o}</li>`).join("") || "<li>None</li>";
    const competitors = report.competitors?.map((c: any) => `<li><strong>${c.name} (${c.marketShare}% share):</strong> ${c.strength}. <em>Vulnerability: ${c.weakness}</em></li>`).join("") || "<li>None mapped</li>";

    const emailHtml = `
      <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto;">
        <h1 style="color: #2563eb;">VentureVitals AI Validation Report</h1>
        <p>Here is your comprehensive evaluation for the idea: <strong>"${idea}"</strong></p>
        
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Verdict: ${report.verdict}</h2>
          <p><strong>Score:</strong> ${report.score} / 100</p>
          <p><strong>Confidence:</strong> ${report.confidenceLevel}</p>
        </div>

        <h3>Executive Summary</h3>
        <p>${executiveSummary}</p>

        <h3>Market Competitors</h3>
        <ul>${competitors}</ul>

        <h3>Major Risks</h3>
        <ul>${majorRisks}</ul>

        <h3>Opportunity Signals</h3>
        <ul>${opportunities}</ul>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">This automated report was generated securely by VentureVitals AI.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // For unpaid Resend accounts, you must send FROM onboarding@resend.dev TO your own verified email.
        // For verified domains, use "Reports <reports@yourdomain.com>".
        from: "VentureVitals AI <onboarding@resend.dev>",
        to: [email],
        subject: `Your Validation Report: ${report.score}/100 Score`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend API Error:", resData);
      return new Response(
        JSON.stringify({ error: resData.message || "Failed to send email via Resend" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error in email-report:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
