export interface CostItem {
  item: string;
  amount: string;
  note: string;
}

export interface BudgetScenario {
  range: string;
  includes: string[];
  tradeoffs: string;
}

export interface LocationTier {
  label: string;
  costMultiplier: string;
  keyDifferences: string[];
}

export interface HiddenCost {
  item: string;
  estimated: string;
  note: string;
}

export interface BudgetAnalysis {
  businessOverview: {
    description: string;
    targetCustomers: string;
    businessModel: string;
  };
  costBreakdown: {
    initialSetupCosts: CostItem[];
    monthlyRecurringCosts: CostItem[];
    totalInitialCost: string;
    totalMonthlyCost: string;
  };
  budgetScenarios: {
    low: BudgetScenario;
    medium: BudgetScenario;
    high: BudgetScenario;
  };
  locationAdjustment: {
    tier1: LocationTier;
    tier2: LocationTier;
    tier3: LocationTier;
  };
  hiddenCosts: HiddenCost[];
  investmentSummary: {
    minimumInvestment: string;
    recommendedInvestment: string;
    breakdownSummary: string;
  };
  profitEstimation: {
    expectedMonthlyRevenue: string;
    monthlyExpenses: string;
    expectedProfitRange: string;
    breakEvenMonths: string;
  };
  smartInsights: {
    costSavingStrategies: string[];
    commonMistakes: string[];
    spendMoreOn: string[];
    saveOn: string[];
  };
  growthPlan: {
    sixToTwelveMonths: string[];
    revenueGrowthIdeas: string[];
    scalingIdeas: string[];
  };
}
