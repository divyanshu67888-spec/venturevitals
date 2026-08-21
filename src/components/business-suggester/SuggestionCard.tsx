import { TrendingUp, Clock, AlertTriangle, ChevronDown, Lightbulb, CheckCircle } from "lucide-react";
import type { BusinessSuggestion } from "./types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const difficultyColor = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const riskColor = {
  Low: "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  High: "bg-red-500/10 text-red-400 border-red-500/20",
};

const growthColor = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-primary/10 text-primary",
  High: "bg-accent/10 text-accent",
};

const SuggestionCard = ({ suggestion }: { suggestion: BusinessSuggestion }) => {
  const [expanded, setExpanded] = useState(false);
  if (!suggestion) return null;

  const diffClass = (suggestion.difficultyLevel && difficultyColor[suggestion.difficultyLevel]) || "text-yellow-400";
  const riskClass = (suggestion.riskLevel && riskColor[suggestion.riskLevel]) || riskColor.Medium;
  const growthClass = (suggestion.growthPotential && growthColor[suggestion.growthPotential]) || growthColor.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (suggestion.rank || 1) * 0.08 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-secondary/30 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-primary">#{suggestion.rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-semibold text-foreground">{suggestion.businessName}</h4>
            {suggestion.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                {suggestion.category}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{suggestion.tagline}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-foreground font-medium">{suggestion.estimatedInvestment}</span>
            <span className="text-muted-foreground">·</span>
            <span className={diffClass}>{suggestion.difficultyLevel || "Medium"}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />{suggestion.breakEvenMonths}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-xs text-foreground/80">{suggestion.whyThisBusiness}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Monthly Profit</p>
                  <p className="text-sm font-semibold text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{suggestion.expectedMonthlyProfit}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Growth Potential</p>
                  <p className={`text-sm font-semibold ${growthClass} inline-flex px-2 py-0.5 rounded-md`}>
                    {suggestion.growthPotential || "Medium"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground">Risk:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskClass}`}>
                  {suggestion.riskLevel || "Medium"}
                </span>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Key Requirements
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(suggestion.keyRequirements || []).map((req, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-foreground/70 border border-border">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Quick Tips
                </p>
                <ul className="space-y-1">
                  {(suggestion.quickTips || []).map((tip, i) => (
                    <li key={i} className="text-xs text-foreground/70">• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuggestionCard;
