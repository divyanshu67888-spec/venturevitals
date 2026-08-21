import { TrendingUp, Clock } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const ProfitEstimationSection = ({ data }: { data: BudgetAnalysis["profitEstimation"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        Profit Estimation
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
          <p className="text-sm font-bold text-emerald-400">{data.expectedMonthlyRevenue || "N/A"}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly Expenses</p>
          <p className="text-sm font-bold text-red-400">{data.monthlyExpenses || "N/A"}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Profit Range</p>
          <p className="text-sm font-bold text-primary">{data.expectedProfitRange || "N/A"}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Break-even
          </p>
          <p className="text-sm font-bold text-foreground">{data.breakEvenMonths || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfitEstimationSection;
