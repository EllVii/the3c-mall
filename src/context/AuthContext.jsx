import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { readJSON, writeJSON } from "../utils/Storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isEmailVerified = (authUser) => {
    if (!authUser) return false;
    return Boolean(authUser.email_confirmed_at || authUser.confirmed_at);
  };

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (!isEmailVerified(session.user)) {
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem("auth.session.v1");
            setError("Please verify your email before logging in.");
            return;
          }
          setUser(session.user);
          // Store session ID locally for reference
          writeJSON("auth.session.v1", {
            userId: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("❌ Auth init error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          if (!isEmailVerified(session.user)) {
            supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem("auth.session.v1");
            setError("Please verify your email before logging in.");
            setLoading(false);
            return;
          }
          setUser(session.user);
          writeJSON("auth.session.v1", {
            userId: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString(),
          });
        } else {
          setUser(null);
          localStorage.removeItem("auth.session.v1");
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    try {
      setError(null);
      // Use environment variable if available, fallback to dynamic origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${siteUrl}/app`,
        },
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (err) {
      const message = err?.message || "Sign up failed";
      setError(message);
      return { user: null, error: message };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!isEmailVerified(data.user)) {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem("auth.session.v1");
        const message = "Please verify your email before logging in.";
        setError(message);
        return { user: null, error: message };
      }

      setUser(data.user);
      return { user: data.user, error: null };
    } catch (err) {
      const message = err?.message || "Sign in failed";
      setError(message);
      return { user: null, error: message };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      localStorage.removeItem("auth.session.v1");
      return { error: null };
    } catch (err) {
      const message = err?.message || "Sign out failed";
      setError(message);
      return { error: message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      // Use environment variable if available, fallback to dynamic origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const message = err?.message || "Password reset request failed";
      setError(message);
      return { error: message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const message = err?.message || "Password update failed";
      setError(message);
      return { error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
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
