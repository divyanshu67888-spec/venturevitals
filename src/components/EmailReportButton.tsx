import { useState } from "react";
import { Mail, Loader2, Check, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { WarRoomReport } from "./ValidationReport";

interface EmailReportButtonProps {
  report: WarRoomReport;
  idea: string;
}

export const EmailReportButton = ({ report, idea }: EmailReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("email-report", {
        body: { email, report, idea },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Email Failed", description: data.error, variant: "destructive" });
        return;
      }

      setSent(true);
      toast({ title: "Email Sent Successfully!", description: "Check your inbox for the AI validation report." });
      
      // Auto close after 3 seconds
      setTimeout(() => { 
        setSent(false); 
        setIsOpen(false); 
        setEmail(""); 
      }, 3000);
      
    } catch (err: unknown) {
      console.error("CATCH BLOCK ERROR:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast({ title: "Delivery Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <Mail className="w-4 h-4" /> Email Report
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 p-1 rounded-lg border border-border bg-card">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="px-3 py-1.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none w-48"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={isSending || sent}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        {sent ? (
          <><Check className="w-3 h-3" /> Sent</>
        ) : isSending ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</>
        ) : (
          <><Mail className="w-3 h-3" /> Send</>
        )}
      </button>
    </div>
  );
};

export default EmailReportButton;
