import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense } from "react";

const MiniRobot = lazy(() => import("@/components/MiniRobot"));

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Real-time market intelligence
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="text-4xl md:text-6xl lg:text-7xl text-foreground mb-10 flex flex-col gap-2"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.06 }}
        >
          <span style={{ fontWeight: 500 }} className="flex gap-3 flex-wrap justify-center md:justify-start">
            {["Validate", "ideas."].map((word, i) => (
              <motion.span key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>{word}</motion.span>
            ))}
          </span>
          <span style={{ fontWeight: 700 }} className="flex gap-3 flex-wrap justify-center md:justify-start">
            {["Build", "smarter."].map((word, i) => (
              <motion.span key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>{word}</motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm md:text-base text-muted-foreground max-w-sm mb-10 leading-relaxed font-normal tracking-[-0.01em]"
        >
          AI-powered market intelligence for fast decisions.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-16"
        >
          <motion.a
            href="#war-room"
            whileHover={{ y: -2, boxShadow: "0 0 20px rgba(255, 255, 255, 0.25)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Start analysis
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground"
          >
            See how it works →
          </motion.a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
          className="flex flex-wrap gap-x-12 gap-y-4 border-t border-white/5 pt-8"
        >
          {[
            { value: "< 60s", label: "Report time" },
            { value: "6", label: "Agents deployed" },
            { value: "Live", label: "Market data" },
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <p className="text-2xl font-bold text-foreground font-mono">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
        </div>

        {/* 3D Robot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden md:block relative animate-float-subtle"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur-[80px] w-[80%] h-[80%] mx-auto top-1/2 -translate-y-1/2 z-0"></div>
          <div className="relative z-10 w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <Suspense fallback={<div className="w-full h-[400px]" />}>
              <MiniRobot />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
