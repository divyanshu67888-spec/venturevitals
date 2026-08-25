import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Loader2, ArrowRight, Target, AlertTriangle, CheckSquare, Layers, Building2, MapPin, CalendarDays, Rocket, CheckCircle2 } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { MVPRoadmap } from "./roadmap/types";
import { RoadmapPhaseCard } from "./roadmap/RoadmapPhaseCard";

const timelineOptions = ["1 Month", "3 Months", "6 Months"] as const;

const MvpRoadmap = () => {
  const [businessIdea, setBusinessIdea] = useState("");
  const [timeline, setTimeline] = useState<string>("3 Months");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MVPRoadmap | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessIdea.trim()) {
      toast({ title: "Missing info", description: "Please enter a business idea to generate a roadmap.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/mvp-roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ businessIdea: businessIdea.trim(), timeline }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      setResult(data as MVPRoadmap);
    } catch (err) {
      console.error("Roadmap error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate roadmap. Please try again.";
      toast({ title: "Roadmap Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 border-t border-border bg-secondary/20" id="roadmap">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Route className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider">Launch Planner</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-display">
            MVP & Go-To-Market Roadmap
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            From idea to launch. Get a phase-by-phase actionable sprint plan with tech stack choices and specific milestones.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card overflow-hidden mb-12 shadow-sm"
        >
          <div className="p-5 md:p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">What are you building?</label>
              <div className="relative">
                <Rocket className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="e.g. A marketplace for local home-cooked meals..."
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/40 resize-none transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                Target Launch Timeline
              </label>
              <div className="flex gap-2 flex-wrap">
                {timelineOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTimeline(opt)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      timeline === opt
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-secondary text-muted-foreground border-border hover:border-indigo-500/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground hidden md:inline-block">
              Generates a full timeline with tech stack recommendations
            </span>
            <button
              type="submit"
              disabled={!businessIdea.trim() || isLoading}
              className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building Roadmap…
                </>
              ) : (
                <>
                  Generate Roadmap
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header Card */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{result.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">{result.tagline}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {result.techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-secondary text-sm font-medium text-foreground border border-border flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="inline-flex items-center gap-4 py-2 px-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm">
                  <span className="text-orange-600 font-semibold">Estimated MVP Dev Cost:</span>
                  <span className="text-foreground">{result.estimatedCost.low} - {result.estimatedCost.high}</span>
                </div>
              </div>

              {/* Phases Timeline */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Route className="w-5 h-5 text-indigo-500" /> Execution Phases
                </h3>
                <div className="relative">
                  {/* Vertical Line for Desktop */}
                  <div className="hidden md:block absolute left-5 top-0 bottom-0 w-0.5 bg-border -z-10 mt-10 mb-10"></div>
                  {result.phases.map((phase, idx) => (
                    <RoadmapPhaseCard key={idx} phase={phase} index={idx} />
                  ))}
                </div>
              </div>

              {/* Grid 2 Columns: Metrics & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" /> Key Metrics to Track
                  </h3>
                  <div className="space-y-3">
                    {result.keyMetrics.map((metric, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50 border border-border/50">
                        <span className="text-sm font-medium text-foreground">{metric.metric}</span>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-blue-500">{metric.target}</span>
                          <span className="text-xs text-muted-foreground">{metric.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Primary Risks & Mitigations
                  </h3>
                  <div className="space-y-4">
                    {result.risks.map((risk, i) => (
                      <div key={i} className="border-l-2 border-red-500/50 pl-3">
                        <p className="text-sm font-semibold text-foreground">{risk.risk}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Launch Checklist */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" /> Pre-Launch Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.launchChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-0.5 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MvpRoadmap;
