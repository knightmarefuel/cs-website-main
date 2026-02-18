"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    
    router.push("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card">
          <div className="auth-header">
            <Link href="/" className="auth-logo" data-testid="auth-logo">F3</Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" data-testid="auth-error">
              <div className="alert-content">
                <div className="alert-title">Sign in failed</div>
                <div className="alert-message">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="form">
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                data-testid="input-email"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-solid w-full"
              disabled={loading}
              data-testid="submit-signin"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" data-testid="link-signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
