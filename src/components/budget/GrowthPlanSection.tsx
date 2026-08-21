import { Rocket, TrendingUp, Globe } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const GrowthPlanSection = ({ data }: { data: BudgetAnalysis["growthPlan"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Rocket className="w-4 h-4 text-primary" />
        Growth & Scaling Plan
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
            <Rocket className="w-3 h-3" /> 6-12 Month Expansion
          </p>
          <ul className="space-y-1">
            {(data.sixToTwelveMonths || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Revenue Growth Ideas
          </p>
          <ul className="space-y-1">
            {(data.revenueGrowthIdeas || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Scaling Ideas
          </p>
          <ul className="space-y-1">
            {(data.scalingIdeas || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GrowthPlanSection;
