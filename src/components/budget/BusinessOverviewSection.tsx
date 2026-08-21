import { Briefcase, Users, Cog } from "lucide-react";
import type { BudgetAnalysis } from "./types";

const BusinessOverviewSection = ({ data }: { data: BudgetAnalysis["businessOverview"] }) => {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" />
        Business Overview
      </h3>
      <p className="text-sm text-foreground/80 mb-4">{data.description || ""}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Target Customers
          </p>
          <p className="text-sm text-foreground">{data.targetCustomers || "N/A"}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Cog className="w-3 h-3" /> Business Model
          </p>
          <p className="text-sm text-foreground">{data.businessModel || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverviewSection;
