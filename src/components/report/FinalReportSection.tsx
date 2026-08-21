import { motion } from "framer-motion";
import { Target, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import type { FinalReport } from "../ValidationReport";

interface Props {
  report: FinalReport;
}

const FinalReportSection = ({ report }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8 p-5 rounded-lg bg-card border border-border glow-primary"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <span className="font-mono text-xs font-bold text-primary bg-secondary px-2 py-1 rounded">STEP 4</span>
        <p className="font-mono text-sm font-bold text-foreground tracking-wide">Final 360° Validation</p>
      </div>

      <div className="mb-4">
        <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">Executive Summary</p>
        <p className="text-sm text-secondary-foreground leading-relaxed">{report.executiveSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cross-Agent Insights */}
        <div>
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Cross-Agent Insights
          </p>
          <ul className="space-y-1.5">
            {(report.crossAgentInsights || []).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-secondary-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Major Risks */}
        <div>
          <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Major Risks
          </p>
          <ul className="space-y-1.5">
            {(report.majorRisks || []).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-secondary-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunity Signals */}
        <div>
          <p className="font-mono text-[10px] text-success uppercase tracking-widest mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Opportunity Signals
          </p>
          <ul className="space-y-1.5">
            {(report.opportunitySignals || []).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-secondary-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default FinalReportSection;
