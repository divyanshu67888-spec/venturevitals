export interface BusinessSuggestion {
  rank: number;
  businessName: string;
  category: string;
  tagline: string;
  whyThisBusiness: string;
  estimatedInvestment: string;
  expectedMonthlyProfit: string;
  breakEvenMonths: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  keyRequirements: string[];
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: "Low" | "Medium" | "High";
  quickTips: string[];
}

export interface BusinessSuggesterResult {
  suggestions: BusinessSuggestion[];
  budgetInsight: string;
  topAdvice: string;
}
