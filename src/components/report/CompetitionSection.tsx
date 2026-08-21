import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Competitor } from "../ValidationReport";

const CHART_COLORS = [
  "hsl(186, 100%, 50%)",
  "hsl(39, 100%, 55%)",
  "hsl(142, 70%, 45%)",
  "hsl(270, 70%, 60%)",
  "hsl(340, 80%, 55%)",
  "hsl(200, 80%, 55%)",
];

interface Props {
  competitors?: Competitor[];
}

const CompetitionSection = ({ competitors }: Props) => {
  if (!competitors || competitors.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <p className="font-mono text-sm text-primary tracking-widest uppercase">Market Competition</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg bg-card border border-border">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Market Share Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={competitors} dataKey="marketShare" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={2} stroke="hsl(222, 40%, 9%)" label={({ name, marketShare }) => `${name} ${marketShare}%`} labelLine={false}>
                {competitors.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 25%, 16%)", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`${value}%`, "Market Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {competitors.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-4 rounded-lg bg-card border border-border flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono text-sm font-bold text-foreground">{c.name}</p>
                  <span className="font-mono text-xs text-primary">{c.marketShare}%</span>
                </div>
                <p className="text-xs text-success">✓ {c.strength}</p>
                <p className="text-xs text-accent">⚠ {c.weakness}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CompetitionSection;
