"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/app/providers";

export default function AdminHome() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const isAuthorized = profile?.role === "admin" || profile?.role === "trainer";

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
  }, [loading, session, profile, router]);

  if (loading) {
    return (
      <AppShell>
        <div className="container">
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!isAuthorized) {
    return (
      <AppShell>
        <div className="container">
          <div className="not-authorized">
            <div className="not-authorized-icon">🔒</div>
            <h2 style={{ marginBottom: 8 }}>Access Restricted</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              You don't have permission to access the admin area.
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title" data-testid="admin-title">Admin Panel</h1>
          <p className="page-subtitle">
            Manage communities, classes, sessions, and payments.
          </p>
        </div>

        <nav className="admin-nav" data-testid="admin-nav">
          <Link href="/admin/communities" className="pill pill-primary">Communities</Link>
          <Link href="/admin/class-types" className="pill pill-primary">Class Types</Link>
          <Link href="/admin/sessions" className="pill pill-primary">Sessions</Link>
          <Link href="/admin/payments" className="pill pill-primary">Payments</Link>
        </nav>

        <div className="grid grid-2">
          <Link href="/admin/communities" className="card card-hover" data-testid="admin-communities-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="feature-icon" style={{ margin: 0 }}>🏘️</div>
              <div>
                <h3 className="card-title">Communities</h3>
                <p className="card-description">
                  Add, edit, and manage gated communities where classes are held.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/class-types" className="card card-hover" data-testid="admin-classtypes-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="feature-icon" style={{ margin: 0 }}>🏋️</div>
              <div>
                <h3 className="card-title">Class Types</h3>
                <p className="card-description">
                  Define the types of fitness classes you offer (Yoga, HIIT, etc.).
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/sessions" className="card card-hover" data-testid="admin-sessions-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="feature-icon" style={{ margin: 0 }}>📅</div>
              <div>
                <h3 className="card-title">Sessions</h3>
                <p className="card-description">
                  Schedule and manage class sessions for each community.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/payments" className="card card-hover" data-testid="admin-payments-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="feature-icon" style={{ margin: 0 }}>💳</div>
              <div>
                <h3 className="card-title">Payments</h3>
                <p className="card-description">
                  Review and approve payment submissions from members.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="card mt-6" style={{ background: "var(--bg-secondary)" }}>
          <p className="text-sm text-muted">
            <strong>Note:</strong> To promote a user to admin or trainer, update their role in the{" "}
            <code style={{ background: "var(--surface)", padding: "2px 6px", borderRadius: 4 }}>profiles</code>{" "}
            table in Supabase.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
