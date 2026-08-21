import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, History, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#war-room" },
  { label: "Demo", href: "/#demo" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Economic Data", href: "/economic-data" },
];

interface NavbarProps {
  onHistoryOpen?: () => void;
  historyCount?: number;
}

const Navbar = ({ onHistoryOpen, historyCount = 0 }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="VentureVitals Logo" className="h-8 w-auto object-contain" />
          <span className="font-semibold text-foreground text-sm tracking-wide">
            VentureVitals
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="text-sm font-normal tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 hover:border-b hover:border-primary pb-0.5"
            >
              {link.label}
            </motion.a>
          ))}
          <button
            onClick={onHistoryOpen}
            className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
            title="Recent Analyses"
          >
            <History className="w-4 h-4" />
            <span className="hidden lg:inline">History</span>
            {historyCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="hidden lg:inline text-xs max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <motion.button
                onClick={signOut}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <motion.a
              href="/auth"
              whileHover={{ y: -2, boxShadow: "0 0 20px rgba(255, 255, 255, 0.25)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-button-inset hover:bg-primary/90 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </motion.a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-b border-border px-6 py-4 space-y-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground py-1"
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground border-t border-border/50 mt-2 pt-3">
                <User className="w-4 h-4 text-primary" />
                <span className="truncate">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="block w-full text-sm font-medium px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-center"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground text-center"
            >
              Sign In
            </a>
          )}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
