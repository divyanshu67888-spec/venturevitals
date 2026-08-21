import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Plus, Trash2, Loader2, BookOpen, Upload, CheckCircle2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { knowledgeSeedData } from "@/data/knowledge_seed";
import Navbar from "@/components/Navbar";

const CATEGORIES = ["Market Data", "Startup Funding", "Industry Report", "Cost Data", "General"];

interface KBEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  created_at: string;
}

const KnowledgeBase = () => {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    source: "",
    category: "General",
  });

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("id, title, content, source, category, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to load entries.", variant: "destructive" });
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const { error } = await supabase.functions.invoke("embed-document", {
        body: form,
      });
      if (error) throw error;
      toast({ title: "✅ Added!", description: `"${form.title}" added to the knowledge base.` });
      setForm({ title: "", content: "", source: "", category: "General" });
      setShowForm(false);
      fetchEntries();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to embed document. Check your GOOGLE_API_KEY in Supabase secrets.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Deleted", description: "Entry removed from knowledge base." });
    }
    setDeletingId(null);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    let success = 0;
    for (const item of knowledgeSeedData) {
      try {
        await supabase.functions.invoke("embed-document", { body: item });
        success++;
      } catch {
        // continue
      }
    }
    toast({
      title: `🌱 Seeded ${success}/${knowledgeSeedData.length} entries`,
      description: "Starter Indian startup data added to your knowledge base.",
    });
    setIsSeeding(false);
    fetchEntries();
  };

  const categoryColor: Record<string, string> = {
    "Market Data": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "Startup Funding": "text-purple-400 bg-purple-400/10 border-purple-400/20",
    "Industry Report": "text-orange-400 bg-orange-400/10 border-orange-400/20",
    "Cost Data": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "General": "text-muted-foreground bg-muted/30 border-border",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider">RAG Knowledge Base</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Documents stored here are embedded as vectors and automatically retrieved to ground AI analysis in real data.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setShowForm((p) => !p)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Entry
            </button>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground font-medium text-sm hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
              {isSeeding ? "Seeding…" : "Seed Starter Data"}
            </button>
          </div>
        </motion.div>

        {/* Add Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-primary/20 bg-card p-6 space-y-4"
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" /> New Knowledge Entry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. SaaS Startup Costs India 2024"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Source (optional)</label>
                  <input
                    value={form.source}
                    onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                    placeholder="e.g. NASSCOM Report 2024"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Paste your data, statistics, market insights, cost breakdowns…"
                    rows={5}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isUploading ? "Embedding…" : "Save & Embed"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : `${entries.length} entries in knowledge base`}
          </p>
        </div>

        {/* Entries list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-xl border border-dashed border-border"
          >
            <Database className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No entries yet. Seed the starter data or add your own.</p>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
              Seed Starter Data
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl border border-border bg-card p-4 group hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor[entry.category] || categoryColor["General"]}`}>
                          <Tag className="w-2.5 h-2.5" />
                          {entry.category}
                        </span>
                        {entry.source && (
                          <span className="text-xs text-muted-foreground/60">{entry.source}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{entry.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{entry.content}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
