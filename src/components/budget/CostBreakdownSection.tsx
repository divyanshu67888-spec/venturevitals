import { Receipt, IndianRupee } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const CostBreakdownSection = ({ data }: { data: BudgetAnalysis["costBreakdown"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-primary" />
        Cost Breakdown
      </h3>

      {/* Initial Setup */}
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Initial Setup Costs (One-time)</p>
      <div className="space-y-1.5 mb-4">
        {(data.initialSetupCosts || []).map((c, i) => (
          <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
            <div>
              <p className="text-sm text-foreground">{c.item}</p>
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap ml-3">{c.amount}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          <p className="text-sm font-semibold text-foreground">Total Initial Cost</p>
          <span className="text-sm font-bold text-primary">{data.totalInitialCost || "N/A"}</span>
        </div>
      </div>

      {/* Monthly Recurring */}
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Monthly Recurring Costs</p>
      <div className="space-y-1.5">
        {(data.monthlyRecurringCosts || []).map((c, i) => (
          <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
            <div>
              <p className="text-sm text-foreground">{c.item}</p>
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap ml-3">{c.amount}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          <p className="text-sm font-semibold text-foreground">Total Monthly Cost</p>
          <span className="text-sm font-bold text-accent">{data.totalMonthlyCost || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownSection;
