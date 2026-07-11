import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/apiClient.js";
import { writeJSON } from "../utils/Storage.js";

const AuthContext = createContext(null);
const LOCAL_SESSION_KEY = "auth.session.v1";

function persistSessionReference(user) {
  if (!user) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return;
  }

  writeJSON(LOCAL_SESSION_KEY, {
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function initializeSession() {
      try {
        const data = await apiGet("/api/auth/session");
        if (!active) return;
        setUser(data.user || null);
        persistSessionReference(data.user || null);
      } catch (sessionError) {
        if (!active) return;
        console.error("Auth session initialization failed", sessionError);
        setUser(null);
        persistSessionReference(null);
        setError(sessionError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initializeSession();
    return () => {
      active = false;
    };
  }, []);

  const runAuthAction = async (action) => {
    setLoading(true);
    setError(null);
    try {
      return await action();
    } catch (actionError) {
      const message = actionError?.message || "Authentication request failed";
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = (email, password, metadata = {}) => runAuthAction(async () => {
    const data = await apiPost("/api/auth/signup", { email, password, metadata });
    return {
      user: data.user || null,
      error: null,
      message: data.message,
      emailSent: data.emailSent,
    };
  });

  const signIn = (email, password) => runAuthAction(async () => {
    const data = await apiPost("/api/auth/signin", { email, password });
    setUser(data.user);
    persistSessionReference(data.user);
    return { user: data.user, error: null };
  });

  const signOut = () => runAuthAction(async () => {
    await apiPost("/api/auth/signout", {});
    setUser(null);
    persistSessionReference(null);
    return { error: null };
  });

  const resetPassword = (email) => runAuthAction(async () => {
    const data = await apiPost("/api/auth/request-password-reset", { email });
    return { error: null, message: data.message };
  });

  const resetPasswordWithToken = (token, newPassword) => runAuthAction(async () => {
    const data = await apiPost("/api/auth/reset-password", { token, newPassword });
    return { error: null, message: data.message };
  });

  const updatePassword = (newPassword) => runAuthAction(async () => {
    await apiPost("/api/auth/update-password", { newPassword });
    return { error: null };
  });

  const resendVerification = (email) => runAuthAction(async () => {
    const data = await apiPost("/api/auth/resend-verification", { email });
    return { error: null, message: data.message };
  });

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resetPasswordWithToken,
    updatePassword,
    resendVerification,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
