import React, { createContext, useState, useEffect } from "react";
import { DEFAULT_USER } from "../utils/constants";
import { mockApi } from "../services/mockApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("securelens_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error("Failed to restore auth state", e);
      localStorage.removeItem("securelens_user");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await mockApi.login(email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem("securelens_user", JSON.stringify(res.user));
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await mockApi.signup(name, email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem("securelens_user", JSON.stringify(res.user));
      return res;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setUser(DEFAULT_USER);
    setIsAuthenticated(true);
    localStorage.setItem("securelens_user", JSON.stringify(DEFAULT_USER));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("securelens_user");
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("securelens_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        loading,
        login,
        signup,
        demoLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
