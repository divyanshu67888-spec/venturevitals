import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IdeaInput from "@/components/IdeaInput";
import ValidationReport, { WarRoomReport } from "@/components/ValidationReport";
import Features from "@/components/Features";
import BudgetAdvisor from "@/components/BudgetAdvisor";
import BusinessSuggester from "@/components/BusinessSuggester";
import HistoryPanel from "@/components/HistoryPanel";
import FAQ from "@/components/FAQ";
import { useAnalysisHistory, HistoryEntry } from "@/hooks/useAnalysisHistory";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [report, setReport] = useState<WarRoomReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdea, setCurrentIdea] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addEntry, clearHistory } = useAnalysisHistory();

  const handleSubmit = async (idea: string, mode: "research" | "business" = "research") => {
    setIsLoading(true);
    setReport(null);
    setCurrentIdea(idea);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/war-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ idea, mode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const result = data as WarRoomReport;
      setReport(result);
      // Save to history after every successful analysis
      addEntry(idea, mode, result);

      // Scroll to report
      setTimeout(() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      console.error('War Room error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze your idea. Please try again.";
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreHistory = (entry: HistoryEntry) => {
    setCurrentIdea(entry.ideaText);
    setReport(entry.report);
    setTimeout(() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onHistoryOpen={() => setHistoryOpen(true)} historyCount={history.length} />
      <Hero />
      <Features />
      <IdeaInput onSubmit={(idea, mode) => handleSubmit(idea, mode)} isLoading={isLoading} />
      <BudgetAdvisor />
      <BusinessSuggester />

      {report && (
        <motion.div
          id="demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ValidationReport report={report} idea={currentIdea} />
        </motion.div>
      )}

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-[10px]">V</span>
                </div>
                <span className="font-semibold text-foreground text-sm">VentureVitals</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
                  Make better decisions. Faster.
              </p>
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} VentureVitals. Multi-Agent AI Analysis.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-4">
                Product
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#war-room" },
                  { label: "Demo", href: "#demo" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectEntry={handleRestoreHistory}
        onClear={clearHistory}
      />
    </div>
  );
};

export default Index;
