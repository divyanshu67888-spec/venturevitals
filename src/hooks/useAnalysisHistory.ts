import { useState, useEffect, useCallback } from "react";
import type { WarRoomReport } from "@/components/ValidationReport";

export interface HistoryEntry {
  id: string;
  ideaTitle: string;
  ideaText: string;
  score: number;
  industry: string;
  analysisType: "research" | "business";
  timestamp: number;
  report: WarRoomReport;
}

const STORAGE_KEY = "vv_analysis_history";
const MAX_ENTRIES = 5;

function deriveIndustry(idea: string, report: WarRoomReport): string {
  const lowerIdea = idea.toLowerCase();
  if (lowerIdea.match(/food|restaurant|delivery|cook|recipe|meal/)) return "Food & Bev";
  if (lowerIdea.match(/health|medical|hospital|doctor|fitness|wellness/)) return "HealthTech";
  if (lowerIdea.match(/edu|learn|course|school|tutor/)) return "EdTech";
  if (lowerIdea.match(/finance|invest|bank|insurance|loan|money/)) return "FinTech";
  if (lowerIdea.match(/farm|agri|crop|soil|harvest/)) return "AgriTech";
  if (lowerIdea.match(/fashion|apparel|cloth|wear|style/)) return "Fashion";
  if (lowerIdea.match(/travel|hotel|tourism|trip|flight/)) return "Travel";
  if (lowerIdea.match(/game|gaming|esport|entertainment/)) return "Gaming";
  if (lowerIdea.match(/ecomm|market|shop|store|retail/)) return "E-Commerce";
  if (lowerIdea.match(/ai|ml|deep|neural|chat|robot/)) return "AI / ML";
  if (lowerIdea.match(/saas|software|app|platform|tool/)) return "SaaS";
  if (lowerIdea.match(/real estate|property|rent|house|apartment/)) return "Real Estate";
  if (lowerIdea.match(/logistics|supply|transport|shipping|delivery/)) return "Logistics";
  return "Tech";
}

function deriveTitle(idea: string): string {
  const words = idea.trim().split(/\s+/);
  return words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "");
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage quota exceeded — silently fail
    }
  }, [history]);

  const addEntry = useCallback(
    (idea: string, mode: "research" | "business", report: WarRoomReport) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ideaTitle: deriveTitle(idea),
        ideaText: idea,
        score: report.score ?? 0,
        industry: deriveIndustry(idea, report),
        analysisType: mode,
        timestamp: Date.now(),
        report,
      };

      setHistory((prev) => {
        const updated = [entry, ...prev.filter((e) => e.ideaText !== idea)];
        return updated.slice(0, MAX_ENTRIES);
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
