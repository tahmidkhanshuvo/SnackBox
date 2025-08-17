import { createContext, useContext, useEffect, useState } from "react";

// Auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // Check if user is authenticated
  async function authenticate() {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSession({ token });
      } else {
        localStorage.removeItem("auth_token");
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  }

  // Extend session like refreshSession middleware
  async function refreshSession() {
    if (!session?.token) return;
    try {
      await fetch("/api/auth/refresh", {
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch (err) {
      console.error("Session refresh failed:", err);
    }
  }

  // Role check like can()
  function can(allowedRoles) {
    return user && allowedRoles.includes(user.role);
  }

  // Guest check like guest()
  function isGuest() {
    return !user;
  }

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, authenticate, refreshSession, can, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}
