import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize state directly from localStorage safely
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || "");

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Corrupted user data in storage:", err);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const storedProfile = localStorage.getItem("profile");
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (err) {
      localStorage.removeItem("profile");
      return null;
    }
  });

  // Complete logout — clears everything consistently
  const Logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    setToken("");
    setUser(null);
    setProfile(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Auto-check token expiry on mount + token change
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        console.warn("Access token expired — logging out");
        Logout();
      }
    } catch (err) {
      console.error("Invalid token format — logging out");
      Logout();
    }
  }, [token, Logout]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, profile, setProfile, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
