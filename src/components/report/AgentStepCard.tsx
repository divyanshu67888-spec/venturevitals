import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Minus } from "lucide-react";

interface Section {
  label: string;
  content: string;
}

interface ListGroup {
  label: string;
  items: string[];
  variant: "success" | "warning" | "neutral";
}

interface AgentStepCardProps {
  stepNumber: number;
  title: string;
  sentiment: "positive" | "warning" | "neutral";
  sections: Section[];
  lists?: ListGroup[];
}

const sentimentIcon = {
  positive: CheckCircle,
  warning: AlertTriangle,
  neutral: Minus,
};

const sentimentColor = {
  positive: "text-success",
  warning: "text-accent",
  neutral: "text-muted-foreground",
};

const listBullet: Record<string, string> = {
  success: "text-success",
  warning: "text-accent",
  neutral: "text-muted-foreground",
};

const AgentStepCard = ({ stepNumber, title, sentiment, sections, lists }: AgentStepCardProps) => {
  const Icon = sentimentIcon[sentiment] || Minus;
  const colorClass = sentimentColor[sentiment] || "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 p-5 rounded-lg bg-card border border-border hover:border-glow transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs font-bold text-primary bg-secondary px-2 py-1 rounded">STEP {stepNumber}</span>
        <p className="font-mono text-sm font-bold text-foreground tracking-wide">{title}</p>
        <div className="ml-auto">
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
      </div>

      <div className="space-y-3">
        {(sections || []).map((s) => (
          <div key={s.label}>
            <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-sm text-secondary-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      {lists && lists.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {lists.map((lg) => (
            <div key={lg.label}>
              <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">{lg.label}</p>
              <ul className="space-y-1">
                {(lg.items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-secondary-foreground">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${listBullet[lg.variant] || "text-muted-foreground"} bg-current`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AgentStepCard;
