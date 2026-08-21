import { Layers } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const tierLabels = { low: "Low Budget", medium: "Medium Budget", high: "High Budget" } as const;
const tierColors = {
  low: "border-emerald-400/20 bg-emerald-400/5",
  medium: "border-amber-400/20 bg-amber-400/5",
  high: "border-primary/20 bg-primary/5",
};
const tierBadge = {
  low: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  high: "text-primary bg-primary/10",
};

const BudgetScenariosSection = ({ data }: { data: BudgetAnalysis["budgetScenarios"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        Budget Scenarios Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["low", "medium", "high"] as const).map((tier) => {
          const scenario = data[tier];
          if (!scenario) return null;
          return (
            <div key={tier} className={`rounded-lg border p-4 ${tierColors[tier]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierBadge[tier]}`}>
                  {tierLabels[tier]}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground mb-2">{scenario.range || "N/A"}</p>
              <ul className="space-y-1 mb-3">
                {(scenario.includes || []).map((item, i) => (
                  <li key={i} className="text-xs text-foreground/80">• {item}</li>
                ))}
              </ul>
              {scenario.tradeoffs && (
                <p className="text-xs text-muted-foreground italic">{scenario.tradeoffs}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetScenariosSection;
