import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Loader2, ArrowRight, MapPin, Sparkles, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { BusinessSuggesterResult } from "./business-suggester/types";
import SuggestionCard from "./business-suggester/SuggestionCard";

const budgetPresets = [
  { label: "₹50K", value: "50000" },
  { label: "₹1L", value: "100000" },
  { label: "₹2L", value: "200000" },
  { label: "₹5L", value: "500000" },
  { label: "₹10L", value: "1000000" },
  { label: "₹25L+", value: "2500000" },
];

const locationOptions = ["Tier 1 (Metro)", "Tier 2", "Tier 3", "Custom"] as const;

const BusinessSuggester = () => {
  const [budget, setBudget] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [locationMode, setLocationMode] = useState<string>("Tier 1 (Metro)");
  const [customLocation, setCustomLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BusinessSuggesterResult | null>(null);

  const finalBudget = budget === "custom" ? customBudget : budget;
  const finalLocation = locationMode === "Custom" ? customLocation.trim() : locationMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalBudget) {
      toast({ title: "Missing info", description: "Please select or enter your budget.", variant: "destructive" });
      return;
    }
    if (locationMode === "Custom" && !customLocation.trim()) {
      toast({ title: "Missing info", description: "Please enter your city.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-suggester`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            budget: finalBudget, 
            location: finalLocation, 
            interests: interests.trim() || undefined 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      setResult(data as BusinessSuggesterResult);
    } catch (err) {
      console.error("Business suggester error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get suggestions. Please try again.";
      toast({ title: "Analysis Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 border-t border-border" id="business-suggester">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-lg z-0" />
              <Wallet className="w-4 h-4 text-primary relative z-10" />
            </div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider border-l-2 border-primary pl-2 shadow-[-10px_0_15px_-5px_rgba(0,200,150,0.2)]">Business Suggester</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-display">
            What Business Can I Start?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Enter your available budget and location — AI will suggest the top 5 businesses you can realistically start, with profit estimates and growth potential.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card overflow-hidden mb-8"
        >
          <div className="p-5 space-y-4">
            {/* Budget Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> Your Available Budget (₹)
              </label>
              <div className="flex flex-wrap gap-2">
                {budgetPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBudget(preset.value)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      budget === preset.value
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(0,200,150,0.4)] scale-[1.02]"
                        : "bg-secondary text-muted-foreground border-white/5 shadow-inner hover:border-primary/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBudget("custom")}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    budget === "custom"
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(0,200,150,0.4)] scale-[1.02]"
                      : "bg-secondary text-muted-foreground border-white/5 shadow-inner hover:border-primary/40"
                  }`}
                >
                  Custom
                </button>
              </div>
              {budget === "custom" && (
                <input
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="Enter amount in ₹ — e.g. 75000"
                  className="mt-2 w-full bg-secondary/50 border border-white/5 shadow-inner rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,200,150,0.15)] transition-all duration-300"
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Location */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <select
                  value={locationMode}
                  onChange={(e) => setLocationMode(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/5 shadow-inner rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,200,150,0.15)] transition-all duration-300"
                  disabled={isLoading}
                >
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Interests (optional) */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Interests / Skills (optional)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. cooking, tech, fitness"
                  className="w-full bg-secondary/50 border border-white/5 shadow-inner rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,200,150,0.15)] transition-all duration-300"
                  disabled={isLoading}
                />
              </div>
            </div>

            {locationMode === "Custom" && (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter city name — e.g. Jaipur, Pune, Coimbatore"
                  className="w-full bg-secondary/50 border border-white/5 shadow-inner rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,200,150,0.15)] transition-all duration-300"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">
              {finalBudget
                ? `₹${Number(finalBudget).toLocaleString("en-IN")} · ${finalLocation}`
                : "Select your budget to get started"}
            </span>
            <button
              type="submit"
              disabled={!finalBudget || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-button-inset hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Finding businesses…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggest Businesses
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Budget Insight */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-foreground/90">{result.budgetInsight}</p>
                <p className="text-xs text-primary mt-2 font-medium">💡 {result.topAdvice}</p>
              </div>

              {/* Suggestion Cards */}
              <div className="space-y-3">
                {result.suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.rank} suggestion={suggestion} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BusinessSuggester;
