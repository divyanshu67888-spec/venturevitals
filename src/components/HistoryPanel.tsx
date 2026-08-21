import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, History, X, FlaskConical, Briefcase, ChevronRight } from "lucide-react";
import type { HistoryEntry } from "@/hooks/useAnalysisHistory";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
      : score >= 40
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      : "text-red-400 bg-red-400/10 border-red-400/30";

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[42px] px-2 py-0.5 rounded-md border text-xs font-bold font-mono ${color}`}
    >
      {score}
    </span>
  );
}

const HistoryPanel = ({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onClear,
}: HistoryPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#0a0a0a] border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground font-mono tracking-wide">
                  Recent Analyses
                </span>
                {history.length > 0 && (
                  <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                    {history.length}/{5}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <History className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-xs text-muted-foreground">No analyses yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Run an analysis to see it here.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {history.map((entry, i) => (
                    <motion.button
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        onSelectEntry(entry);
                        onClose();
                      }}
                      className="w-full text-left rounded-xl border border-border bg-card p-3.5 hover:border-primary/30 hover:bg-secondary/50 transition-all group"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1">
                          {entry.ideaTitle}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <ScoreBadge score={entry.score} />
                          <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border bg-primary/5 border-primary/20 text-primary font-mono">
                          {entry.analysisType === "research" ? (
                            <FlaskConical className="w-2.5 h-2.5" />
                          ) : (
                            <Briefcase className="w-2.5 h-2.5" />
                          )}
                          {entry.analysisType}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded border border-border">
                          {entry.industry}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(entry.timestamp)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <button
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-colors font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
