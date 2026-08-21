/**
 * World Bank Indicators API v2 – Service Layer
 * Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 *
 * Base URL pattern:
 *   https://api.worldbank.org/v2/country/{iso2}/indicator/{indicatorCode}?format=json&date={range}&per_page=100
 *
 * No API key required – the service is completely open.
 */

// ───────── Types ─────────

export interface WorldBankDataPoint {
  year: number;
  value: number | null;
  country: string;
  countryCode: string;
  indicator: string;
  indicatorId: string;
}

export interface WorldBankIndicator {
  id: string;
  name: string;
  unit: string;
  description: string;
  category: string;
}

export interface CountryOption {
  code: string;   // ISO-2
  name: string;
}

// ───────── Constants ─────────

const BASE = "https://api.worldbank.org/v2";

/** Curated list of economic / prices / market indicators */
export const INDICATORS: WorldBankIndicator[] = [
  // Prices & Inflation
  {
    id: "FP.CPI.TOTL.ZG",
    name: "Inflation (CPI)",
    unit: "% annual",
    description: "Consumer Price Index – annual % change",
    category: "Prices & Inflation",
  },
  {
    id: "FP.CPI.TOTL",
    name: "Consumer Price Index",
    unit: "Index (2010=100)",
    description: "Consumer Price Index for all items",
    category: "Prices & Inflation",
  },
  {
    id: "FP.WPI.TOTL",
    name: "Wholesale Price Index",
    unit: "Index (2010=100)",
    description: "Wholesale / Producer Price Index",
    category: "Prices & Inflation",
  },
  {
    id: "NY.GDP.DEFL.KD.ZG",
    name: "GDP Deflator",
    unit: "% annual",
    description: "GDP deflator – annual % change",
    category: "Prices & Inflation",
  },
  // GDP & Growth
  {
    id: "NY.GDP.MKTP.CD",
    name: "GDP (Current USD)",
    unit: "USD",
    description: "Gross Domestic Product at current US dollars",
    category: "GDP & Growth",
  },
  {
    id: "NY.GDP.MKTP.KD.ZG",
    name: "GDP Growth Rate",
    unit: "% annual",
    description: "GDP growth – annual %",
    category: "GDP & Growth",
  },
  {
    id: "NY.GDP.PCAP.CD",
    name: "GDP per Capita",
    unit: "USD",
    description: "GDP per capita in current US dollars",
    category: "GDP & Growth",
  },
  // Trade & Markets
  {
    id: "TM.VAL.MRCH.CD.WT",
    name: "Merchandise Imports",
    unit: "USD",
    description: "Merchandise imports – current US dollars",
    category: "Trade & Markets",
  },
  {
    id: "TX.VAL.MRCH.CD.WT",
    name: "Merchandise Exports",
    unit: "USD",
    description: "Merchandise exports – current US dollars",
    category: "Trade & Markets",
  },
  {
    id: "BN.CAB.XOKA.CD",
    name: "Current Account Balance",
    unit: "USD",
    description: "Current account balance (BoP) – current US dollars",
    category: "Trade & Markets",
  },
  // Financial
  {
    id: "FR.INR.LEND",
    name: "Lending Interest Rate",
    unit: "%",
    description: "Lending interest rate",
    category: "Financial",
  },
  {
    id: "FR.INR.RINR",
    name: "Real Interest Rate",
    unit: "%",
    description: "Real interest rate",
    category: "Financial",
  },
  {
    id: "PA.NUS.FCRF",
    name: "Exchange Rate (LCU/USD)",
    unit: "LCU per USD",
    description: "Official exchange rate (LCU per US$, period average)",
    category: "Financial",
  },
  // Commodities & Energy
  {
    id: "EP.PMP.SGAS.CD",
    name: "Gasoline Price",
    unit: "USD per liter",
    description: "Pump price for gasoline (US$ per liter)",
    category: "Commodities & Energy",
  },
  {
    id: "EP.PMP.DESL.CD",
    name: "Diesel Price",
    unit: "USD per liter",
    description: "Pump price for diesel fuel (US$ per liter)",
    category: "Commodities & Energy",
  },
  {
    id: "EG.USE.PCAP.KG.OE",
    name: "Energy Use per Capita",
    unit: "kg oil equiv.",
    description: "Energy use (kg of oil equivalent per capita)",
    category: "Commodities & Energy",
  },
];

/** Popular countries */
export const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "FR", name: "France" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "KR", name: "South Korea" },
  { code: "MX", name: "Mexico" },
  { code: "ID", name: "Indonesia" },
  { code: "RU", name: "Russia" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "UAE" },
  { code: "SG", name: "Singapore" },
  { code: "IT", name: "Italy" },
];

// ───────── API Helpers ─────────

/**
 * Fetch a single indicator for one country over a date range.
 */
export async function fetchIndicator(
  countryCode: string,
  indicatorId: string,
  startYear = 2000,
  endYear = 2024
): Promise<WorldBankDataPoint[]> {
  const url = `${BASE}/country/${countryCode}/indicator/${indicatorId}?format=json&date=${startYear}:${endYear}&per_page=500`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);

  const json = await res.json();

  // API returns [metadata, dataArray]
  if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
    return [];
  }

  return (json[1] as any[])
    .map((d: any) => ({
      year: parseInt(d.date, 10),
      value: d.value,
      country: d.country?.value ?? "",
      countryCode: d.countryiso3code ?? countryCode,
      indicator: d.indicator?.value ?? "",
      indicatorId: d.indicator?.id ?? indicatorId,
    }))
    .filter((d) => d.value !== null)
    .sort((a, b) => a.year - b.year);
}

/**
 * Fetch multiple indicators for one country in parallel.
 */
export async function fetchMultipleIndicators(
  countryCode: string,
  indicatorIds: string[],
  startYear = 2000,
  endYear = 2024
): Promise<Record<string, WorldBankDataPoint[]>> {
  const results = await Promise.allSettled(
    indicatorIds.map((id) => fetchIndicator(countryCode, id, startYear, endYear))
  );

  const map: Record<string, WorldBankDataPoint[]> = {};
  indicatorIds.forEach((id, i) => {
    map[id] = results[i].status === "fulfilled" ? results[i].value : [];
  });
  return map;
}

/**
 * Compare one indicator across multiple countries.
 */
export async function fetchIndicatorComparison(
  countryCodes: string[],
  indicatorId: string,
  startYear = 2000,
  endYear = 2024
): Promise<Record<string, WorldBankDataPoint[]>> {
  const results = await Promise.allSettled(
    countryCodes.map((cc) => fetchIndicator(cc, indicatorId, startYear, endYear))
  );

  const map: Record<string, WorldBankDataPoint[]> = {};
  countryCodes.forEach((cc, i) => {
    map[cc] = results[i].status === "fulfilled" ? results[i].value : [];
  });
  return map;
}

// ───────── Utility ─────────

/** Group indicators by their category */
export function getIndicatorsByCategory(): Record<string, WorldBankIndicator[]> {
  const grouped: Record<string, WorldBankIndicator[]> = {};
  INDICATORS.forEach((ind) => {
    if (!grouped[ind.category]) grouped[ind.category] = [];
    grouped[ind.category].push(ind);
  });
  return grouped;
}

/** Format large numbers into human-readable strings */
export function formatValue(value: number, unit: string): string {
  if (unit === "USD" || unit === "LCU per USD") {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }
  if (unit.includes("%")) {
    return `${value.toFixed(2)}%`;
  }
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(2);
}
