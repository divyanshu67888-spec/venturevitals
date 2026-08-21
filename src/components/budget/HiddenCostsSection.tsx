import { AlertTriangle } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const HiddenCostsSection = ({ data }: { data: BudgetAnalysis["hiddenCosts"] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        Hidden / Extra Costs
      </h3>
      <div className="space-y-2">
        {data.map((cost, i) => (
          <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
            <div>
              <p className="text-sm text-foreground">{cost.item}</p>
              <p className="text-xs text-muted-foreground">{cost.note}</p>
            </div>
            <span className="text-sm font-semibold text-amber-400 whitespace-nowrap ml-3">{cost.estimated}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenCostsSection;
