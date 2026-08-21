import { motion } from "framer-motion";
import { Lightbulb, Rocket, Zap } from "lucide-react";
import type { Improvement } from "../ValidationReport";

const impactColor: Record<string, string> = {
  high: "text-success",
  medium: "text-accent",
  low: "text-muted-foreground",
};

interface Props {
  improvements?: Improvement[];
}

const ImprovementsSection = ({ improvements }: Props) => {
  if (!improvements || improvements.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        <p className="font-mono text-sm text-accent tracking-widest uppercase">Improvements & Bold Ideas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {improvements.map((idea, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-4 rounded-lg bg-card border border-border hover:border-glow transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              {idea.type === "outOfBox" ? <Rocket className="w-4 h-4 text-accent" /> : <Zap className="w-4 h-4 text-primary" />}
              <p className="font-mono text-xs font-bold text-foreground">{idea.title}</p>
              <span className={`ml-auto font-mono text-[10px] uppercase tracking-wider ${impactColor[idea.impact]}`}>{idea.impact}</span>
            </div>
            <p className="text-sm text-secondary-foreground leading-relaxed">{idea.description}</p>
            <span className={`inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded ${idea.type === "outOfBox" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
              {idea.type === "outOfBox" ? "OUT OF BOX" : "CORE"}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImprovementsSection;
