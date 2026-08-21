import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, FlaskConical, Briefcase } from "lucide-react";
import VoiceInputButton from "./VoiceInputButton";

interface IdeaInputProps {
  onSubmit: (idea: string, mode: "research" | "business") => void;
  isLoading: boolean;
}

const modes = [
  {
    key: "research" as const,
    label: "Research",
    icon: FlaskConical,
    placeholder: "e.g. Investigating the impact of microplastics on freshwater ecosystems...",
    description: "Validate hypotheses with structured reasoning and live data",
  },
  {
    key: "business" as const,
    label: "Business",
    icon: Briefcase,
    placeholder: "e.g. A subscription service delivering organic produce to urban apartments...",
    description: "Market validation with competition analysis and revenue strategy",
  },
];

const suggestions = [
  "Food delivery app",
  "AI fitness coach",
  "Local service marketplace",
];

const IdeaInput = ({ onSubmit, isLoading }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");
  const [activeMode, setActiveMode] = useState<"research" | "business">("research");

  const currentMode = modes.find((m) => m.key === activeMode)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) onSubmit(idea.trim(), activeMode);
  };

  return (
    <section className="py-20 px-6 border-t border-border" id="war-room">
      <div className="max-w-2xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Describe your idea
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a mode and let our agents do the rest.
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-1 p-1 bg-card/40 backdrop-blur-md border border-white/5 rounded-lg w-fit mb-2 relative z-10"
        >
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => setActiveMode(mode.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all z-20 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{mode.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="modeTab"
                    className="absolute inset-0 bg-secondary/60 rounded-md border border-white/10 z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground mb-4"
          >
            {currentMode.description}
          </motion.p>
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
        >
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-glass-panel overflow-hidden focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(0,200,150,0.15)] transition-all duration-300 relative z-10"
          >
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={currentMode.placeholder}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 p-4 resize-none focus:outline-none text-sm leading-relaxed min-h-[120px]"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <VoiceInputButton
                  onTranscript={(text) => setIdea((prev) => (prev ? prev + " " + text : text))}
                  disabled={isLoading}
                />
                <span className="text-xs text-muted-foreground">
                  {idea.length > 0 ? `${idea.length} characters` : "Type or speak your idea"}
                </span>
              </div>

              {/* Analyze Button */}
              <motion.button
                type="submit"
                disabled={!idea.trim() || isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-button-inset hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing</span>
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full bg-primary-foreground inline-block"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </span>
                  </>
                ) : (
                  <>
                    Run analysis
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.form>

        {/* Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mt-4"
        >
          <span className="text-xs text-muted-foreground/50 self-center mr-1">Try:</span>
          {suggestions.map((s) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => setIdea(s)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-3 py-1 rounded-full text-xs text-muted-foreground border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              {s}
            </motion.button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default IdeaInput;
