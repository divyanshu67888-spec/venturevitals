import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Who should use VentureVital?",
    answer:
      "VentureVital is built for founders, product managers, and business researchers who need fast, data-backed insight before committing time or capital to a new idea.",
  },
  {
    question: "Do I need technical skills to validate my idea?",
    answer:
      "None at all. Just describe your idea in plain language. Our AI agents handle market research, competitive analysis, and risk scoring — no data science required.",
  },
  {
    question: "How accurate are the validation results?",
    answer:
      "Results are generated from live market data pulled in real time, not outdated training sets. Each report is structured analysis across six dimensions — far more comprehensive than manual research.",
  },
  {
    question: "How long does a full validation report take?",
    answer:
      "Under 60 seconds. Six specialized AI agents run in parallel — analyzing market fit, competition, pricing, risks, opportunities, and growth potential simultaneously.",
  },
  {
    question: "What kind of ideas can I validate?",
    answer:
      "Anything from SaaS products and consumer apps to physical businesses, e-commerce stores, or local service concepts. The agents adapt their analysis to the idea type.",
  },
  {
    question: "Can I save and revisit my past analyses?",
    answer:
      "Yes. Every report is saved to your history automatically. You can restore any previous analysis, compare results, or use them as a starting point for iteration.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-foreground text-center mb-16 tracking-[-0.03em] leading-[1.06]"
        >
          Frequently asked questions
        </motion.h2>

        {/* FAQ Items */}
        <div>
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="border-t border-border"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span
                  className={`text-sm md:text-base font-medium transition-colors ${
                    openIndex === index
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {faq.question}
                </span>
                <span className="ml-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                  {openIndex === index ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed pb-5 max-w-2xl">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {/* Bottom border */}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
};

export default FAQ;
