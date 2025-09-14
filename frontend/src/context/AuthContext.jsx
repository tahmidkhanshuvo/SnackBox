import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Minimal SPA auth store using localStorage ("sb_auth")
// Expect shape: { token: "…", user: { id, name, role: "customer"|"staff"|"admin" } }
const STORAGE_KEY = "sb_auth";

const AuthContext = createContext({
  user: null,
  role: "guest",
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = (payload) => setSession(payload);
  const logout = () => setSession(null);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    const role = (user?.role ?? "guest").toLowerCase();
    return {
      user,
      role,
      isAuthenticated: !!session?.token && !!user,
      login,
      logout,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
