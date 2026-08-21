import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Landmark,
  ArrowRightLeft,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import type {
  EconomicData,
  WorldBankRawEntry,
} from "../ValidationReport";

interface Props {
  economicData: EconomicData;
  worldBankRaw?: Record<string, WorldBankRawEntry>;
}

// ─── Custom Tooltip ───
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1.5 font-mono">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground font-mono">
            {typeof p.value === "number" ? p.value.toFixed(2) : "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Tile ───
function EconStat({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-card/60 rounded-xl border border-border p-4 relative overflow-hidden group hover:border-primary/20 transition-all"
    >
      <div
        className="absolute top-0 left-0 w-full h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-foreground font-mono">{value}</p>
    </motion.div>
  );
}

const EconomicDataSection = ({ economicData, worldBankRaw }: Props) => {
  // Build the yearly trends chart data from economicData.yearlyTrends or worldBankRaw
  const chartData =
    economicData.yearlyTrends?.length > 0
      ? economicData.yearlyTrends.map((t) => ({
          year: t.year,
          "GDP Growth (%)": t.gdpGrowth,
          "Inflation (%)": t.inflation,
          "Lending Rate (%)": t.lendingRate,
        }))
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Economic & Prices Data
          </h3>
          <p className="text-xs text-muted-foreground">
            Precise figures from World Bank Open Data •{" "}
            {economicData.country || "India"}
          </p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          VERIFIED DATA
        </span>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <EconStat
          icon={DollarSign}
          label="GDP"
          value={economicData.gdpCurrent}
          color="#22c55e"
          delay={0}
        />
        <EconStat
          icon={TrendingUp}
          label="GDP Growth"
          value={economicData.gdpGrowthRate}
          color="#3b82f6"
          delay={0.05}
        />
        <EconStat
          icon={Activity}
          label="Inflation (CPI)"
          value={economicData.inflationRate}
          color="#f59e0b"
          delay={0.1}
        />
        <EconStat
          icon={BarChart3}
          label="Lending Rate"
          value={economicData.lendingRate}
          color="#a78bfa"
          delay={0.15}
        />
        <EconStat
          icon={ArrowRightLeft}
          label="Exchange Rate"
          value={economicData.exchangeRate}
          color="#14b8a6"
          delay={0.2}
        />
      </div>

      {/* Economic Outlook */}
      {economicData.economicOutlook && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="bg-card/60 rounded-xl border border-border p-5 mb-6"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Economic Outlook
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {economicData.economicOutlook}
          </p>
        </motion.div>
      )}

      {/* Key Insights */}
      {economicData.keyInsights?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-card/60 rounded-xl border border-border p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              How This Affects Your Idea
            </p>
          </div>
          <div className="space-y-2">
            {economicData.keyInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Yearly Trends Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="bg-card/60 rounded-xl border border-border p-5 relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 w-full h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent, #3b82f6, #22c55e, #f59e0b, transparent)",
            }}
          />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Yearly Economic Trends
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradGDP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInflation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="GDP Growth (%)"
                stroke="#22c55e"
                fill="url(#gradGDP)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#0d0d0d" }}
              />
              <Area
                type="monotone"
                dataKey="Inflation (%)"
                stroke="#f59e0b"
                fill="url(#gradInflation)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#0d0d0d" }}
              />
              <Area
                type="monotone"
                dataKey="Lending Rate (%)"
                stroke="#a78bfa"
                fill="url(#gradLending)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#0d0d0d" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Attribution */}
          <p className="text-[10px] text-muted-foreground/50 mt-3 text-right">
            Source: World Bank Open Data API — data.worldbank.org
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EconomicDataSection;
