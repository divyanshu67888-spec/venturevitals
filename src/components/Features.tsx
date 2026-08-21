import { motion } from "framer-motion";
import { Search, Zap, Shield, TrendingUp, Globe, Brain } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Live market data",
    description: "Real-time signals, not stale data.",
  },
  {
    icon: Brain,
    title: "6 focused agents",
    description: "Each agent covers a distinct dimension.",
  },
  {
    icon: Zap,
    title: "60-second reports",
    description: "Weeks of research. One minute.",
  },
  {
    icon: Globe,
    title: "Geo-targeted insights",
    description: "Local context that actually matters.",
  },
  {
    icon: Shield,
    title: "Risk identification",
    description: "Spot blind spots before they cost you.",
  },
  {
    icon: TrendingUp,
    title: "Opportunity scoring",
    description: "Clear go/no-go, backed by data.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-lg"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
            Clear insights in seconds.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-xl">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)", borderColor: "rgba(0,200,150,0.3)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
              className="bg-card p-7 transition-colors duration-300 cursor-default rounded-xl shadow-feature-card border border-[rgba(255,255,255,0.06)] border-t-[rgba(255,255,255,0.12)] border-l-[rgba(255,255,255,0.12)]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
