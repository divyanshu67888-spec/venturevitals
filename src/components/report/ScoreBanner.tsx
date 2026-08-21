import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck } from "lucide-react";

interface ScoreBannerProps {
  score: number;
  verdict: string;
  confidenceLevel: string;
}

const ScoreBanner = ({ score, verdict, confidenceLevel }: ScoreBannerProps) => {
  const confidenceColor = confidenceLevel === "High" ? "text-success" : confidenceLevel === "Moderate" ? "text-accent" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="mb-8 p-6 rounded-lg bg-card border border-border glow-primary text-center"
    >
      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Research Viability Score</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-6xl font-bold text-primary glow-text font-mono">{score}</span>
        <span className="text-muted-foreground text-lg">/100</span>
      </div>
      <p className="text-sm text-success font-mono mt-2 flex items-center justify-center gap-1.5">
        <CheckCircle className="w-4 h-4" />
        {verdict}
      </p>
      <p className={`text-xs font-mono mt-1 flex items-center justify-center gap-1 ${confidenceColor}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        Confidence: {confidenceLevel}
      </p>
    </motion.div>
  );
};

export default ScoreBanner;
