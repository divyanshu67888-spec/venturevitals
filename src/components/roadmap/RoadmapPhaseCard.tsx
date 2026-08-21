import { motion } from "framer-motion";
import { RoadmapPhase } from "./types";
import { Clock, CheckCircle2, Flag } from "lucide-react";

export const RoadmapPhaseCard = ({ phase, index }: { phase: RoadmapPhase; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 md:pl-0"
    >
      <div className="md:grid md:grid-cols-12 gap-6 relative">
        {/* Timeline connector (desktop) */}
        <div className="hidden md:flex col-span-2 flex-col items-center relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
            <span className="text-primary font-bold">{phase.phase}</span>
          </div>
          {/* Line - handled globally if possible or absolute */}
        </div>

        {/* Timeline connector (mobile) */}
        <div className="absolute left-0 top-0 bottom-0 md:hidden flex flex-col items-center w-8">
          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10 mt-1">
            <span className="text-primary font-bold text-sm">{phase.phase}</span>
          </div>
          <div className="w-px h-full bg-border flex-1 -mt-2z"></div>
        </div>

        {/* Content */}
        <div className="md:col-span-10 bg-card border border-border rounded-xl p-5 mb-6 md:mb-8 shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {phase.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{phase.goal}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground border border-border">
              <Clock className="w-3.5 h-3.5" />
              {phase.weeks}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Key Tasks
              </h4>
              <ul className="space-y-2">
                {phase.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-3 bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <div className="mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'critical' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{task.task}</p>
                      <span className="text-xs text-muted-foreground">{task.duration}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Deliverables
                </h4>
                <ul className="space-y-1">
                  {phase.deliverables.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500/50 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 border border-accent/10">
                <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Milestone
                </h4>
                <p className="text-sm text-foreground font-medium">{phase.milestone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
