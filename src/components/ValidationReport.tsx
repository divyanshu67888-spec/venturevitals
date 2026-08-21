import { useMemo } from "react";
import { motion } from "framer-motion";
import ScoreBanner from "./report/ScoreBanner";
import AgentStepCard from "./report/AgentStepCard";
import FinalReportSection from "./report/FinalReportSection";
import PertChartSection from "./report/PertChartSection";
import SourceTransparency from "./report/SourceTransparency";
import DimensionCharts from "./report/DimensionCharts";
import MarketMetricsSection from "./report/MarketMetricsSection";
import CompetitionSection from "./report/CompetitionSection";
import ImprovementsSection from "./report/ImprovementsSection";
import ListenButton from "./ListenButton";
import EmailReportButton from "./EmailReportButton";
import MVPRoadmapBuilder from "./MVPRoadmapBuilder";
import EconomicDataSection from "./report/EconomicDataSection";

export interface StepSentiment {
  sentiment: "positive" | "warning" | "neutral";
}

export interface StatisticalSkeptic extends StepSentiment {
  statisticalSignals: string;
  quantitativeTrends: string;
  riskIndicators: string;
  dataGaps: string;
}

export interface TheorySpecialist extends StepSentiment {
  theoreticalContext: string;
  strategicEvaluation: string;
  strengths: string[];
  weaknesses: string[];
  conceptualGaps: string;
}

export interface MethodologyCritic extends StepSentiment {
  assumptionsIdentified: string[];
  methodologicalRisks: string;
  biasAnalysis: string;
  feasibilityConcerns: string;
}

export interface FinalReport {
  executiveSummary: string;
  crossAgentInsights: string[];
  majorRisks: string[];
  opportunitySignals: string[];
  pertChartMermaid?: string;
}

export interface SourceEntry {
  type: string;
  relevance: "high" | "medium" | "low";
  note: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
}

export interface MarketMetrics {
  tam: string;
  sam: string;
  som: string;
  cagr: string;
  yearOverYear: { year: string; value: number }[];
}

export interface Competitor {
  name: string;
  marketShare: number;
  strength: string;
  weakness: string;
}

export interface Improvement {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  type: "core" | "outOfBox";
}

export interface EconomicYearlyTrend {
  year: string;
  gdpGrowth: number;
  inflation: number;
  lendingRate: number;
}

export interface EconomicData {
  country: string;
  gdpCurrent: string;
  gdpGrowthRate: string;
  inflationRate: string;
  lendingRate: string;
  exchangeRate: string;
  economicOutlook: string;
  keyInsights: string[];
  yearlyTrends: EconomicYearlyTrend[];
}

export interface WorldBankRawEntry {
  label: string;
  data: { year: number; value: number }[];
}

export interface WarRoomReport {
  score: number;
  confidenceLevel: string;
  verdict: string;
  step1_statisticalSkeptic: StatisticalSkeptic;
  step2_theorySpecialist: TheorySpecialist;
  step3_methodologyCritic: MethodologyCritic;
  step4_finalReport: FinalReport;
  step5_sources: { sourceTypes: SourceEntry[] };
  marketMetrics?: MarketMetrics;
  dimensionScores?: DimensionScore[];
  competitors?: Competitor[];
  improvements?: Improvement[];
  economicData?: EconomicData;
  _worldBankRaw?: Record<string, WorldBankRawEntry>;
  // Legacy fields for backwards compat
  agents?: unknown[];
}

interface ValidationReportProps {
  report: WarRoomReport;
  idea?: string;
}

const ValidationReport = ({ report, idea = "" }: ValidationReportProps) => {
  const summaryText = useMemo(() => {
    const parts = [
      `Overall score: ${report.score} out of 100. Confidence: ${report.confidenceLevel}.`,
      report.verdict,
      report.step4_finalReport?.executiveSummary,
    ];
    if (report.step4_finalReport?.majorRisks?.length) {
      parts.push("Major risks include: " + report.step4_finalReport.majorRisks.join(", ") + ".");
    }
    if (report.step4_finalReport?.opportunitySignals?.length) {
      parts.push("Key opportunities: " + report.step4_finalReport.opportunitySignals.join(", ") + ".");
    }
    return parts.filter(Boolean).join(" ");
  }, [report]);

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-3">
            AI Research Validation Engine
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            360° Research Validation Report
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            <ListenButton text={summaryText} label="Listen to summary" />
            <EmailReportButton report={report} idea={idea} />
          </div>
        </motion.div>

        {/* Score Banner */}
        <ScoreBanner score={report.score} verdict={report.verdict} confidenceLevel={report.confidenceLevel} />

        {/* Dimension Charts + Market Growth */}
        <DimensionCharts dimensionScores={report.dimensionScores} marketMetrics={report.marketMetrics} />

        {/* TAM / SAM / SOM */}
        <MarketMetricsSection marketMetrics={report.marketMetrics} />

        {/* Step 1 — Statistical Skeptic */}
        {report.step1_statisticalSkeptic && (
          <AgentStepCard
            stepNumber={1}
            title="Statistical Skeptic"
            sentiment={report.step1_statisticalSkeptic.sentiment}
            sections={[
              { label: "Statistical Signals", content: report.step1_statisticalSkeptic.statisticalSignals },
              { label: "Quantitative Trends", content: report.step1_statisticalSkeptic.quantitativeTrends },
              { label: "Risk Indicators", content: report.step1_statisticalSkeptic.riskIndicators },
              { label: "Data Gaps", content: report.step1_statisticalSkeptic.dataGaps },
            ]}
          />
        )}

        {/* Step 2 — Theory Specialist */}
        {report.step2_theorySpecialist && (
          <AgentStepCard
            stepNumber={2}
            title="Research Theory Specialist"
            sentiment={report.step2_theorySpecialist.sentiment}
            sections={[
              { label: "Theoretical Context", content: report.step2_theorySpecialist.theoreticalContext },
              { label: "Strategic Evaluation", content: report.step2_theorySpecialist.strategicEvaluation },
              { label: "Conceptual Gaps", content: report.step2_theorySpecialist.conceptualGaps },
            ]}
            lists={[
              { label: "Strengths", items: report.step2_theorySpecialist.strengths, variant: "success" },
              { label: "Weaknesses", items: report.step2_theorySpecialist.weaknesses, variant: "warning" },
            ]}
          />
        )}

        {/* Step 3 — Methodology Critic */}
        {report.step3_methodologyCritic && (
          <AgentStepCard
            stepNumber={3}
            title="Methodology Critic"
            sentiment={report.step3_methodologyCritic.sentiment}
            sections={[
              { label: "Methodological Risks", content: report.step3_methodologyCritic.methodologicalRisks },
              { label: "Bias Analysis", content: report.step3_methodologyCritic.biasAnalysis },
              { label: "Feasibility Concerns", content: report.step3_methodologyCritic.feasibilityConcerns },
            ]}
            lists={[
              { label: "Assumptions Identified", items: report.step3_methodologyCritic.assumptionsIdentified, variant: "neutral" },
            ]}
          />
        )}

        {/* Step 4 — Final 360° Report */}
        {report.step4_finalReport && (
          <>
            <FinalReportSection report={report.step4_finalReport} />
            {report.step4_finalReport.pertChartMermaid && (
              <PertChartSection chart={report.step4_finalReport.pertChartMermaid} />
            )}
          </>
        )}

        {/* Competition */}
        <CompetitionSection competitors={report.competitors} />

        {/* Improvements */}
        <ImprovementsSection improvements={report.improvements} />

        {/* Step 5 — Source Transparency */}
        {report.step5_sources && (
          <SourceTransparency sources={report.step5_sources.sourceTypes} />
        )}

        {/* Economic Data from World Bank */}
        {report.economicData && (
          <EconomicDataSection
            economicData={report.economicData}
            worldBankRaw={report._worldBankRaw}
          />
        )}

        {/* MVP Roadmap Builder */}
        {idea && (
          <MVPRoadmapBuilder idea={idea} score={report.score} verdict={report.verdict} />
        )}
      </div>
    </section>
  );
};

export default ValidationReport;
