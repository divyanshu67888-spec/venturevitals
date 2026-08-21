import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import type { DimensionScore, MarketMetrics } from "../ValidationReport";

const CHART_COLORS = [
  "hsl(186, 100%, 50%)",
  "hsl(39, 100%, 55%)",
  "hsl(142, 70%, 45%)",
  "hsl(270, 70%, 60%)",
  "hsl(340, 80%, 55%)",
  "hsl(200, 80%, 55%)",
];

interface Props {
  dimensionScores?: DimensionScore[];
  marketMetrics?: MarketMetrics;
}

const DimensionCharts = ({ dimensionScores, marketMetrics }: Props) => {
  if (!dimensionScores && !marketMetrics?.yearOverYear) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {dimensionScores && (
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-5 rounded-lg bg-card border border-border">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-4">Dimension Analysis</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={dimensionScores}>
                <PolarGrid stroke="hsl(222, 25%, 16%)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                <Radar dataKey="score" stroke="hsl(186, 100%, 50%)" fill="hsl(186, 100%, 50%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {marketMetrics?.yearOverYear && (
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-5 rounded-lg bg-card border border-border">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-1">Market Growth Projection</p>
            {marketMetrics.cagr && <p className="text-xs text-muted-foreground mb-3">CAGR: {marketMetrics.cagr}</p>}
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={marketMetrics.yearOverYear}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 16%)" />
                <XAxis dataKey="year" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} tickFormatter={(v) => `$${v}B`} />
                <Tooltip contentStyle={{ background: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 25%, 16%)", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`$${value}B`, "Market Size"]} />
                <Area type="monotone" dataKey="value" stroke="hsl(186, 100%, 50%)" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Dimension Bar Chart */}
      {dimensionScores && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 p-5 rounded-lg bg-card border border-border">
          <p className="font-mono text-xs text-primary tracking-widest uppercase mb-4">Research Dimension Breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dimensionScores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 16%)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <YAxis type="category" dataKey="dimension" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 25%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {dimensionScores.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </>
  );
};

export default DimensionCharts;
