import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Map, Rocket, Target, AlertTriangle, CheckCircle2, Clock, Zap, IndianRupee, Code2 } from "lucide-react";
import type { MVPRoadmap } from "./roadmap/types";

interface MVPRoadmapBuilderProps {
  idea: string;
  score?: number;
  verdict?: string;
}

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-primary/10 text-primary border-primary/20",
};

const phaseColors = [
  { bg: "bg-blue-500/5", border: "border-blue-500/20", accent: "text-blue-600", dot: "bg-blue-500" },
  { bg: "bg-amber-500/5", border: "border-amber-500/20", accent: "text-amber-600", dot: "bg-amber-500" },
  { bg: "bg-emerald-500/5", border: "border-emerald-500/20", accent: "text-emerald-600", dot: "bg-emerald-500" },
];

const MVPRoadmapBuilder = ({ idea, score, verdict }: MVPRoadmapBuilderProps) => {
  const [roadmap, setRoadmap] = useState<MVPRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateRoadmap = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mvp-roadmap", {
        body: { idea, score, verdict },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
        return;
      }
      setRoadmap(data as MVPRoadmap);
    } catch {
      toast({ title: "Error", description: "Failed to generate roadmap.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!roadmap) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 border border-border rounded-xl p-8 bg-card text-center"
      >
        <Map className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">90-Day MVP Roadmap</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get a step-by-step plan to build your product — phases, tasks, costs, and launch checklist.
        </p>
        <button
          onClick={generateRoadmap}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" /> Generate Roadmap
            </>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-10"
    >
      {/* Header */}
      <div className="border border-border rounded-xl p-6 bg-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-1">90-Day MVP Roadmap</p>
            <h3 className="text-2xl font-bold text-foreground">{roadmap.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{roadmap.tagline}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {roadmap.techStack.map((tech) => (
              <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-foreground">
                <Code2 className="w-3 h-3" /> {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4 mb-6">
        {roadmap.phases.map((phase, i) => {
          const colors = phaseColors[i] || phaseColors[0];
          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`border ${colors.border} rounded-xl p-6 ${colors.bg}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full ${colors.dot} flex items-center justify-center text-white font-bold text-sm`}>
                  {phase.phase}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{phase.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {phase.weeks}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{phase.goal}</p>

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                {phase.tasks.map((task, j) => (
                  <div key={j} className="flex items-center gap-3 bg-background/60 rounded-lg px-3 py-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-foreground flex-1">{task.task}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{task.duration}</span>
                  </div>
                ))}
              </div>

              {/* Deliverables & Milestone */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="font-medium text-foreground">Deliverables: </span>
                  <span className="text-muted-foreground">{phase.deliverables.join(", ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className={`w-3 h-3 ${colors.accent}`} />
                  <span className="font-medium text-foreground">Milestone:</span>
                  <span className="text-muted-foreground">{phase.milestone}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Key Metrics + Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-border rounded-xl p-5 bg-card">
          <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Key Metrics
          </h4>
          <div className="space-y-2">
            {roadmap.keyMetrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{m.metric}</span>
                <div className="text-right">
                  <span className="font-medium text-foreground">{m.target}</span>
                  <span className="text-xs text-muted-foreground ml-2">by {m.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-xl p-5 bg-card">
          <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> Estimated Cost
          </h4>
          <div className="space-y-2">
            {(["low", "medium", "high"] as const).map((tier) => (
              <div key={tier} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{tier} Budget</span>
                <span className="font-medium text-foreground">{roadmap.estimatedCost[tier]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risks */}
      <div className="border border-border rounded-xl p-5 bg-card mb-6">
        <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" /> Risks & Mitigations
        </h4>
        <div className="space-y-3">
          {roadmap.risks.map((r, i) => (
            <div key={i} className="text-sm">
              <p className="text-foreground font-medium">{r.risk}</p>
              <p className="text-muted-foreground text-xs mt-0.5">↳ {r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Checklist */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Launch Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {roadmap.launchChecklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MVPRoadmapBuilder;
