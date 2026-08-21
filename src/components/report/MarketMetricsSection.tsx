import { motion } from "framer-motion";
import type { MarketMetrics } from "../ValidationReport";

interface Props {
  marketMetrics?: MarketMetrics;
}

const MarketMetricsSection = ({ marketMetrics }: Props) => {
  if (!marketMetrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-3 gap-4 mb-8"
    >
      {[
        { label: "TAM", value: marketMetrics.tam },
        { label: "SAM", value: marketMetrics.sam },
        { label: "SOM", value: marketMetrics.som },
      ].map((m) => (
        <div key={m.label} className="p-4 rounded-lg bg-card border border-border text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{m.label}</p>
          <p className="text-xl md:text-2xl font-bold text-primary font-mono mt-1">{m.value}</p>
        </div>
      ))}
    </motion.div>
  );
};

export default MarketMetricsSection;
