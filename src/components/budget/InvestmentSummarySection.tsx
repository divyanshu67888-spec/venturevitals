import { IndianRupee } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const InvestmentSummarySection = ({ data }: { data: BudgetAnalysis["investmentSummary"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-primary" />
        Total Investment Summary
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Minimum Investment</p>
          <p className="text-lg font-bold text-foreground">{data.minimumInvestment || "N/A"}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Recommended Investment</p>
          <p className="text-lg font-bold text-primary">{data.recommendedInvestment || "N/A"}</p>
        </div>
      </div>
      <p className="text-sm text-foreground/80">{data.breakdownSummary || ""}</p>
    </div>
  );
};

export default InvestmentSummarySection;
