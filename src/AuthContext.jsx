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
      localStorage.removeItem("user"); // Clean bad data
      return null;
    }
  });

  // Complete logout — clears everything consistently
  const Logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    navigate("/login", { replace: true }); // Replace history so back button won't return
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
    <AuthContext.Provider value={{ token, setToken, user, setUser, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// import { createContext, useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from 'jwt-decode';

// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate()

//   const [token, setToken] = useState(
//     () => localStorage.getItem("access_token") || ""
//   )

//   const [user, setUser] = useState(
//     () => {
//       try {
//         const stored = localStorage.getItem("user");
//         return stored ? JSON.parse(stored) : null;
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//         return null;
//       }
//     }
//   )

//   const Logout = useCallback(() => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("refresh_token");
//     setToken("");
//     setUser(null);
//     navigate("/login");
//   }, [navigate])

//   useEffect(() => {
//     if (!token) return
//     try {
//       const decode = jwtDecode(token);
//       const isExpired = decode.exp * 1000 < Date.now();
//       if (isExpired) Logout();
//     } catch (error) {
//       Logout();
//     }
//   }, [token, Logout])

//   return (
//     <AuthContext.Provider value={{ token, setToken, user, setUser, Logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }