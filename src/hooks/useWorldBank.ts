import { useQuery } from "@tanstack/react-query";
import {
  fetchIndicator,
  fetchMultipleIndicators,
  fetchIndicatorComparison,
  WorldBankDataPoint,
} from "@/lib/worldbank";

/**
 * Fetch a single World Bank indicator for one country.
 */
export function useWorldBankIndicator(
  countryCode: string,
  indicatorId: string,
  startYear = 2000,
  endYear = 2024
) {
  return useQuery<WorldBankDataPoint[]>({
    queryKey: ["worldbank", countryCode, indicatorId, startYear, endYear],
    queryFn: () => fetchIndicator(countryCode, indicatorId, startYear, endYear),
    staleTime: 1000 * 60 * 30, // 30 min cache
    retry: 2,
    enabled: !!countryCode && !!indicatorId,
  });
}

/**
 * Fetch multiple indicators for a single country.
 */
export function useWorldBankMultiIndicators(
  countryCode: string,
  indicatorIds: string[],
  startYear = 2000,
  endYear = 2024
) {
  return useQuery<Record<string, WorldBankDataPoint[]>>({
    queryKey: ["worldbank-multi", countryCode, indicatorIds, startYear, endYear],
    queryFn: () =>
      fetchMultipleIndicators(countryCode, indicatorIds, startYear, endYear),
    staleTime: 1000 * 60 * 30,
    retry: 2,
    enabled: !!countryCode && indicatorIds.length > 0,
  });
}

/**
 * Compare one indicator across multiple countries.
 */
export function useWorldBankComparison(
  countryCodes: string[],
  indicatorId: string,
  startYear = 2000,
  endYear = 2024
) {
  return useQuery<Record<string, WorldBankDataPoint[]>>({
    queryKey: ["worldbank-compare", countryCodes, indicatorId, startYear, endYear],
    queryFn: () =>
      fetchIndicatorComparison(countryCodes, indicatorId, startYear, endYear),
    staleTime: 1000 * 60 * 30,
    retry: 2,
    enabled: countryCodes.length > 0 && !!indicatorId,
  });
}
