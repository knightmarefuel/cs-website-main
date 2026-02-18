"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

export default function Nav() {
  const { session, profile, loading, signOut } = useAuth();

  const isSignedIn = !!session;
  const isAdmin = profile?.role === "admin";
  const isTrainer = profile?.role === "trainer";
  const hasProfile = !!profile;

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Vitamin F3 Home" data-testid="brand-link">
          <div className="logo-mark">F3</div>
          <div className="brand-text">
            <span className="brand-name">Vitamin F3</span>
            <span className="brand-tagline">Community Fitness</span>
          </div>
        </Link>

        <nav className="nav-links" data-testid="nav-links">
          {loading ? (
            <span className="pill" style={{ opacity: 0.5 }}>Loading...</span>
          ) : isSignedIn ? (
            <>
              {hasProfile && (
                <Link className="pill" href="/dashboard" data-testid="nav-dashboard">
                  Dashboard
                </Link>
              )}
              
              {(isAdmin || isTrainer) && (
                <Link className="pill" href="/admin" data-testid="nav-admin">
                  Admin
                </Link>
              )}

              <div className="nav-user">
                {hasProfile && (
                  <div className="nav-user-info">
                    <div className="nav-user-name">{profile.full_name}</div>
                    <div className="nav-user-role">{profile.role}</div>
                  </div>
                )}
                <button
                  className="pill"
                  onClick={handleSignOut}
                  data-testid="nav-signout"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link className="pill" href="/auth/sign-in" data-testid="nav-signin">
                Sign in
              </Link>
              <Link className="pill pill-primary" href="/auth/sign-up" data-testid="nav-signup">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
