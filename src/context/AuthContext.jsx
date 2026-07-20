import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  changePassword,
  getSession,
  requestPasswordReset,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from "../lib/apiClient.js";
import { writeJSON } from "../utils/Storage.js";

const AuthContext = createContext(null);

function messageFrom(error, fallback) {
  return error?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const data = await getSession();
        if (!active) return;
        setUser(data?.user || null);
        if (data?.user) {
          writeJSON("auth.session.v1", {
            userId: data.user.id,
            email: data.user.email,
            timestamp: new Date().toISOString(),
            provider: "cloudflare-d1",
          });
        } else {
          localStorage.removeItem("auth.session.v1");
        }
      } catch (sessionError) {
        if (!active) return;
        console.error("Auth initialization failed", sessionError);
        setUser(null);
        localStorage.removeItem("auth.session.v1");
        setError("The sign-in service is temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signUpAccount(email, password, metadata);
      return { user: null, data, error: null };
    } catch (signUpError) {
      const message = messageFrom(signUpError, "Sign up failed");
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInAccount(email, password);
      setUser(data.user);
      writeJSON("auth.session.v1", {
        userId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString(),
        provider: "cloudflare-d1",
      });
      return { user: data.user, error: null };
    } catch (signInError) {
      const message = messageFrom(signInError, "Sign in failed");
      setUser(null);
      localStorage.removeItem("auth.session.v1");
      setError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOutAccount();
      setUser(null);
      localStorage.removeItem("auth.session.v1");
      return { error: null };
    } catch (signOutError) {
      const message = messageFrom(signOutError, "Sign out failed");
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestPasswordReset(email);
      return { data, error: null };
    } catch (resetError) {
      const message = messageFrom(resetError, "Password reset request failed");
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await changePassword(newPassword);
      return { error: null };
    } catch (passwordError) {
      const message = messageFrom(passwordError, "Password update failed");
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: Boolean(user),
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
