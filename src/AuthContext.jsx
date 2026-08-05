import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import api from "./services/api";

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

// Persist wrappers — keep localStorage in sync with state so the profile
  // picture / details survive page reloads and don't flicker back to stale values.
  const persistProfile = useCallback((value) => {
    setProfile((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        if (next === null) localStorage.removeItem('profile');
        else localStorage.setItem('profile', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to persist profile:', err);
      }
      return next;
    });
  }, []);

  const persistUser = useCallback((value) => {
    setUser((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        if (next === null) localStorage.removeItem('user');
        else localStorage.setItem('user', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to persist user:', err);
      }
      return next;
    });
  }, []);

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

  // Refresh the profile on load (and whenever the token changes) so the
  // profile picture / details are always the latest — never stale/flickering.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res = await api.get("core/profile/");
        if (!cancelled && res.data) {
          // Admin GET now returns a real profile object (with id) — persist it.
          // Landlord/tenant responses are profile objects too. Only skip when
          // the response is a bare message (e.g. legacy/no-profile).
          if (!res.data.message || res.data.id) {
            persistProfile(res.data);
          }
        }
      } catch (err) {
        // Non-fatal — keep whatever we have in localStorage.
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [token, persistProfile]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser: persistUser, profile, setProfile: persistProfile, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
