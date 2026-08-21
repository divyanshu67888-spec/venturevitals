import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import type { SourceEntry } from "../ValidationReport";

interface Props {
  sources: SourceEntry[];
}

const relevanceColor: Record<string, string> = {
  high: "text-success",
  medium: "text-accent",
  low: "text-muted-foreground",
};

const SourceTransparency = ({ sources }: Props) => {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8 p-5 rounded-lg bg-card border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileSearch className="w-5 h-5 text-primary" />
        <span className="font-mono text-xs font-bold text-primary bg-secondary px-2 py-1 rounded">STEP 5</span>
        <p className="font-mono text-sm font-bold text-foreground tracking-wide">Source Transparency</p>
      </div>

      <div className="space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded bg-secondary/50">
            <span className={`font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 w-20 ${relevanceColor[s.relevance] || "text-muted-foreground"}`}>
              {s.relevance}
            </span>
            <div>
              <p className="font-mono text-xs font-bold text-foreground">{s.type}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SourceTransparency;
