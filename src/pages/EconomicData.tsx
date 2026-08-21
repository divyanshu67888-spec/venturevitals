import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  INDICATORS,
  COUNTRIES,
  getIndicatorsByCategory,
  formatValue,
  type WorldBankIndicator,
  type CountryOption,
} from "@/lib/worldbank";
import {
  useWorldBankIndicator,
  useWorldBankComparison,
} from "@/hooks/useWorldBank";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  BarChart3,
  Activity,
  Fuel,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  Loader2,
  RefreshCw,
  LineChart as LineChartIcon,
} from "lucide-react";

// ─────── Category Colors & Icons ───────

const CATEGORY_META: Record<
  string,
  { color: string; gradient: string; icon: any }
> = {
  "Prices & Inflation": {
    color: "#f59e0b",
    gradient: "from-amber-500/20 to-amber-600/5",
    icon: TrendingUp,
  },
  "GDP & Growth": {
    color: "#22c55e",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    icon: BarChart3,
  },
  "Trade & Markets": {
    color: "#3b82f6",
    gradient: "from-blue-500/20 to-blue-600/5",
    icon: Globe,
  },
  Financial: {
    color: "#a78bfa",
    gradient: "from-violet-500/20 to-violet-600/5",
    icon: DollarSign,
  },
  "Commodities & Energy": {
    color: "#f97316",
    gradient: "from-orange-500/20 to-orange-600/5",
    icon: Fuel,
  },
};

const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
  "#f97316",
  "#ec4899",
];

// ─────── Sub-components ───────

function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find((c) => c.code === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-sm font-medium min-w-[180px] justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg leading-none">
            {getFlagEmoji(value)}
          </span>
          {selected?.name ?? "Select Country"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-64 max-h-72 overflow-auto rounded-xl bg-card border border-border shadow-2xl p-1"
          >
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  c.code === value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="text-base">{getFlagEmoji(c.code)}</span>
                {c.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChartTypePicker({
  value,
  onChange,
}: {
  value: "line" | "area" | "bar";
  onChange: (v: "line" | "area" | "bar") => void;
}) {
  const types: { id: "line" | "area" | "bar"; label: string }[] = [
    { id: "line", label: "Line" },
    { id: "area", label: "Area" },
    { id: "bar", label: "Bar" },
  ];
  return (
    <div className="flex rounded-lg overflow-hidden border border-border bg-card">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === t.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  color,
}: {
  label: string;
  value: string;
  change: number | null;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 relative overflow-hidden group hover:border-primary/20 transition-all"
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 left-0 w-full h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground mb-1 font-mono">
        {value}
      </p>
      {change !== null && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            change > 0
              ? "text-emerald-400"
              : change < 0
              ? "text-red-400"
              : "text-muted-foreground"
          }`}
        >
          {change > 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : change < 0 ? (
            <ArrowDownRight className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          {Math.abs(change).toFixed(2)}% vs prev year
        </div>
      )}
    </motion.div>
  );
}

function LoadingPulse() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Fetching economic data from World Bank…
        </p>
      </div>
    </div>
  );
}

// ─────── Helpers ───────

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function computeYoYChange(data: { year: number; value: number | null }[]) {
  if (data.length < 2) return null;
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  if (!latest.value || !prev.value || prev.value === 0) return null;
  return ((latest.value - prev.value) / Math.abs(prev.value)) * 100;
}

// ─────── Custom Tooltip ───────

function CustomTooltip({ active, payload, label }: any) {
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
            {typeof p.value === "number" ? p.value.toLocaleString() : "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────── Main Page ───────

export default function EconomicData() {
  const [country, setCountry] = useState("US");
  const [selectedIndicator, setSelectedIndicator] = useState<WorldBankIndicator>(
    INDICATORS[0]
  );
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");
  const [compareCountries, setCompareCountries] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const grouped = useMemo(() => getIndicatorsByCategory(), []);
  const categories = Object.keys(grouped);

  // Fetch single-country data for the selected indicator
  const {
    data: mainData,
    isLoading: loadingMain,
    refetch: refetchMain,
  } = useWorldBankIndicator(country, selectedIndicator.id);

  // Fetch comparison data when countries are selected
  const allCompareCodes = useMemo(
    () => [country, ...compareCountries],
    [country, compareCountries]
  );
  const {
    data: compareData,
    isLoading: loadingCompare,
  } = useWorldBankComparison(
    compareCountries.length > 0 ? allCompareCodes : [],
    selectedIndicator.id
  );

  // Derive stats from main data
  const latestValue = mainData?.length
    ? mainData[mainData.length - 1]
    : null;
  const yoyChange = mainData ? computeYoYChange(mainData) : null;

  // Build chart data
  const chartData = useMemo(() => {
    if (compareCountries.length > 0 && compareData) {
      // Merge all countries into a unified year-based dataset
      const yearMap: Record<number, any> = {};
      for (const [cc, points] of Object.entries(compareData)) {
        const cName = COUNTRIES.find((c) => c.code === cc)?.name ?? cc;
        for (const pt of points) {
          if (!yearMap[pt.year]) yearMap[pt.year] = { year: pt.year };
          yearMap[pt.year][cName] = pt.value;
        }
      }
      return Object.values(yearMap).sort(
        (a: any, b: any) => a.year - b.year
      );
    }
    // Single country
    return (mainData ?? []).map((d) => ({
      year: d.year,
      [selectedIndicator.name]: d.value,
    }));
  }, [mainData, compareData, compareCountries, selectedIndicator]);

  const chartLines = useMemo(() => {
    if (compareCountries.length > 0) {
      return allCompareCodes.map((cc, i) => ({
        key: COUNTRIES.find((c) => c.code === cc)?.name ?? cc,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    return [{ key: selectedIndicator.name, color: CHART_COLORS[0] }];
  }, [compareCountries, allCompareCodes, selectedIndicator]);

  const toggleCompare = (code: string) => {
    setCompareCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 4
        ? [...prev, code]
        : prev
    );
  };

  const isLoading = loadingMain || loadingCompare;
  const meta = CATEGORY_META[selectedIndicator.category];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero header */}
      <section className="pt-28 pb-12 px-6 border-b border-border relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: meta?.color ?? "#22c55e" }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary">
                World Bank Economic Data
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
              Global Economic &<br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    meta?.color ?? "#22c55e"
                  }, ${meta?.color ?? "#22c55e"}88)`,
                }}
              >
                Prices Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Real-time economic indicators, commodity prices, and financial
              data from the World Bank. Compare across countries and track
              trends over time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ─── Controls Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8"
        >
          <CountryPicker value={country} onChange={setCountry} />
          <ChartTypePicker value={chartType} onChange={setChartType} />
          <button
            onClick={() => refetchMain()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* ─── Category Tabs ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {categories.map((cat) => {
            const m = CATEGORY_META[cat];
            const Icon = m?.icon ?? BarChart3;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(isActive ? null : cat)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: m?.color }} />
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* ─── Indicator Grid ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10"
        >
          {(activeCategory ? grouped[activeCategory] : INDICATORS).map(
            (ind) => {
              const m = CATEGORY_META[ind.category];
              const active = ind.id === selectedIndicator.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndicator(ind)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    active
                      ? "border-primary/40 bg-gradient-to-br " +
                        (m?.gradient ?? "from-white/5 to-white/0") +
                        " shadow-lg"
                      : "border-border bg-card hover:border-primary/20 hover:bg-card/80"
                  }`}
                >
                  <p className="text-xs font-semibold text-foreground truncate mb-0.5">
                    {ind.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {ind.unit}
                  </p>
                </button>
              );
            }
          )}
        </motion.div>

        {/* ─── Stats Cards ─── */}
        {!isLoading && mainData && mainData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Latest Value"
              value={
                latestValue
                  ? formatValue(latestValue.value!, selectedIndicator.unit)
                  : "N/A"
              }
              change={yoyChange}
              color={meta?.color ?? "#22c55e"}
            />
            <StatCard
              label="Data Year"
              value={latestValue ? String(latestValue.year) : "—"}
              change={null}
              color={meta?.color ?? "#3b82f6"}
            />
            <StatCard
              label="Data Points"
              value={String(mainData.length)}
              change={null}
              color={meta?.color ?? "#a78bfa"}
            />
            <StatCard
              label="Time Range"
              value={
                mainData.length > 0
                  ? `${mainData[0].year}–${mainData[mainData.length - 1].year}`
                  : "—"
              }
              change={null}
              color={meta?.color ?? "#f59e0b"}
            />
          </div>
        )}

        {/* ─── Main Chart ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl border border-border p-6 mb-10 relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 w-full h-0.5"
            style={{
              background: `linear-gradient(90deg, transparent, ${
                meta?.color ?? "#22c55e"
              }, transparent)`,
            }}
          />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <LineChartIcon
                  className="w-5 h-5"
                  style={{ color: meta?.color }}
                />
                {selectedIndicator.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedIndicator.description} •{" "}
                {COUNTRIES.find((c) => c.code === country)?.name}
                {compareCountries.length > 0 &&
                  ` + ${compareCountries.length} more`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <LoadingPulse />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
              No data available for this indicator/country combination.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <defs>
                    {chartLines.map((l) => (
                      <linearGradient
                        key={l.key}
                        id={`grad-${l.key.replace(/\s/g, "")}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={l.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={l.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
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
                    tickFormatter={(v: number) =>
                      formatValue(v, selectedIndicator.unit)
                    }
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {chartLines.map((l) => (
                    <Area
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      stroke={l.color}
                      fill={`url(#grad-${l.key.replace(/\s/g, "")})`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: "#0d0d0d" }}
                    />
                  ))}
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart data={chartData}>
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
                    tickFormatter={(v: number) =>
                      formatValue(v, selectedIndicator.unit)
                    }
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {chartLines.map((l) => (
                    <Bar
                      key={l.key}
                      dataKey={l.key}
                      fill={l.color}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={chartData}>
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
                    tickFormatter={(v: number) =>
                      formatValue(v, selectedIndicator.unit)
                    }
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {chartLines.map((l) => (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      stroke={l.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: "#0d0d0d" }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* ─── Country Comparison ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6 mb-10"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Compare Countries
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Select up to 4 additional countries to overlay on the chart.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((c) => c.code !== country).map((c) => {
              const active = compareCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleCompare(c.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  <span className="text-sm">{getFlagEmoji(c.code)}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Data Table ─── */}
        {!isLoading && mainData && mainData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl border border-border overflow-hidden mb-10"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Raw Data — {selectedIndicator.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Year
                    </th>
                    <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      YoY Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...mainData].reverse().slice(0, 15).map((d, i) => {
                    const prev = mainData.find((p) => p.year === d.year - 1);
                    const change =
                      prev?.value && d.value && prev.value !== 0
                        ? ((d.value - prev.value) / Math.abs(prev.value)) * 100
                        : null;
                    return (
                      <tr
                        key={d.year}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-6 py-3 font-mono text-foreground">
                          {d.year}
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-foreground">
                          {d.value !== null
                            ? formatValue(d.value, selectedIndicator.unit)
                            : "—"}
                        </td>
                        <td className="px-6 py-3 text-right font-mono">
                          {change !== null ? (
                            <span
                              className={
                                change > 0
                                  ? "text-emerald-400"
                                  : change < 0
                                  ? "text-red-400"
                                  : "text-muted-foreground"
                              }
                            >
                              {change > 0 ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── Attribution ─── */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Data sourced from the{" "}
            <a
              href="https://data.worldbank.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              World Bank Open Data
            </a>{" "}
            API • Updates reflect latest available annual data
          </p>
        </div>
      </div>
    </div>
  );
}
