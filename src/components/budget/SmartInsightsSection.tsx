import { Lightbulb, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const SmartInsightsSection = ({ data }: { data: BudgetAnalysis["smartInsights"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        Smart Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
            <ArrowDownCircle className="w-3 h-3" /> Cost-Saving Strategies
          </p>
          <ul className="space-y-1">
            {(data.costSavingStrategies || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Common Mistakes
          </p>
          <ul className="space-y-1">
            {(data.commonMistakes || []).map((m, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {m}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
            <ArrowUpCircle className="w-3 h-3" /> Spend More On
          </p>
          <ul className="space-y-1">
            {(data.spendMoreOn || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
            <ArrowDownCircle className="w-3 h-3" /> Save On
          </p>
          <ul className="space-y-1">
            {(data.saveOn || []).map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartInsightsSection;
