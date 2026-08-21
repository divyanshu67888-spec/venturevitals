import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, setUserFromAuth, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login(email, password);
        setUserFromAuth(response.token, response.email, response.displayName);
        toast({
          title: "Welcome back!",
          description: "You've signed in successfully.",
        });
        navigate("/");
      } else {
        const response = await authApi.signup(email, password, displayName);
        setUserFromAuth(response.token, response.email, response.displayName);
        toast({
          title: "Account created!",
          description: "Welcome to VentureVitals.",
        });
        navigate("/");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome back!",
        description: "Signed in with Google successfully.",
      });
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google Sign-In failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle, hsl(0 0% 100%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, hsl(0 0% 80%) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center justify-center gap-2.5 mb-8"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_20px_hsl(168_60%_50%/0.3)]">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">
            VentureVitals
          </span>
        </motion.a>

        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)]">
          <CardHeader className="text-center pb-4 pt-8">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {isLogin
                  ? "Sign in to continue to VentureVitals"
                  : "Get started with AI-powered business validation"}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 pb-8">
            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Display Name (signup only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="auth-name"
                    className="text-xs text-muted-foreground uppercase tracking-wider font-medium"
                  >
                    Display Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="auth-name"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-11 h-12 bg-secondary/30 border-border/50 rounded-xl transition-all duration-300 focus:bg-secondary/50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="auth-email"
                  className="text-xs text-muted-foreground uppercase tracking-wider font-medium"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 bg-secondary/30 border-border/50 rounded-xl transition-all duration-300 focus:bg-secondary/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="auth-password"
                  className="text-xs text-muted-foreground uppercase tracking-wider font-medium"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-11 pr-11 h-12 bg-secondary/30 border-border/50 rounded-xl transition-all duration-300 focus:bg-secondary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 gap-2 rounded-xl text-sm font-medium shadow-[0_0_20px_hsl(168_60%_50%/0.2)] hover:shadow-[0_0_30px_hsl(168_60%_50%/0.35)] transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-4 text-muted-foreground/70">
                  {isLogin ? "New to VentureVitals?" : "Already have an account?"}
                </span>
              </div>
            </div>

            {/* Google Login */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                className="w-full h-12 gap-3 rounded-xl border-border/60 bg-background/40 hover:bg-background/80 transition-all duration-300"
              >
                {googleLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                  />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        style={{ fill: "#4285F4" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        style={{ fill: "#34A853" }}
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        style={{ fill: "#FBBC05" }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        style={{ fill: "#EA4335" }}
                      />
                    </svg>
                    <span className="text-sm font-medium">Continue with Google</span>
                  </>
                )}
              </Button>
            </motion.div>

            {/* Toggle */}
            <p className="text-center text-sm text-muted-foreground">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
              >
                {isLogin ? "Create a free account" : "Sign in instead"}
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
          By continuing, you agree to VentureVitals' Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
