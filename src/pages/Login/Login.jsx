import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Key, Mail, Lock, UserPlus, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Common/Button";
import { Card } from "../../components/Common/Card";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, demoLogin, loading } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleDemo = async () => {
    await demoLogin();
    navigate(from, { replace: true });
  };

  return (
    <Card hover={false} className="p-8 border-zinc-800 bg-[#18181B]/90 backdrop-blur-2xl shadow-2xl space-y-6 max-w-md w-full mx-auto">
      {/* Mode Switcher Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 font-mono text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === "login"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(""); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === "signup"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {mode === "login" ? "Forensics Access Portal" : "Create Analyst Account"}
        </h2>
        <p className="text-xs text-zinc-400">
          {mode === "login"
            ? "Sign in to access your media verification dashboard"
            : "Register for deepfake media authenticity verification"}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Vance"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vance@securelens.ai"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={mode === "login" ? LogIn : UserPlus}
          className="w-full"
        >
          {mode === "login" ? "Sign In to Console" : "Complete Registration"}
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-800 space-y-3">
        <Button variant="secondary" size="md" icon={Key} onClick={handleDemo} className="w-full">
          One-Click Demo Analyst Access
        </Button>

        <p className="text-[11px] text-center font-mono text-zinc-500">
          Quick demo access with empty analysis workspace — upload media to begin.
        </p>
      </div>
    </Card>
  );
};
