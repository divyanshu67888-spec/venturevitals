import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/lib/api";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  setUserFromAuth: (token: string, email: string, displayName: string) => void;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  refreshUser: async () => {},
  setUserFromAuth: () => {},
  signInWithGoogle: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("vv_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      // Token is invalid or expired
      localStorage.removeItem("vv_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signOut = () => {
    localStorage.removeItem("vv_token");
    setUser(null);
  };

  const setUserFromAuth = (token: string, email: string, displayName: string) => {
    localStorage.setItem("vv_token", token);
    setUser({
      id: 0,
      email,
      displayName: displayName || "",
      createdAt: new Date().toISOString(),
    });
  };
  
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email) {
        // Authenticate with our Spring Boot backend
        const response = await authApi.googleLogin(user.email, user.displayName || "");
        setUserFromAuth(response.token, response.email, response.displayName);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        refreshUser: fetchCurrentUser,
        setUserFromAuth,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
