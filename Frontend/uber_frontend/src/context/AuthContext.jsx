import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "./authContextValue";

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/auth/me");
        const freshUser = response.data.user;

        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login: saveSession,
      logout,
      setUser
    }),
    [user, token, loading, saveSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
