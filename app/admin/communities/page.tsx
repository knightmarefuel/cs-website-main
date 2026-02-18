"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/app/providers";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonTableRows } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import type { Community } from "@/lib/types";

export default function AdminCommunities() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState<Community[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized = profile?.role === "admin";

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
  }, [loading, session, profile, router]);

  async function load() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      addToast("danger", "Failed to load communities", error.message);
    } else {
      setItems((data as Community[]) ?? []);
    }
    setLoadingData(false);
  }

  useEffect(() => {
    if (isAuthorized) load();
  }, [isAuthorized]);

  async function addCommunity(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("communities").insert({
      name: name.trim(),
      area: area.trim() || null,
      is_active: true,
    });

    if (error) {
      addToast("danger", "Failed to add community", error.message);
    } else {
      addToast("success", "Community added");
      setName("");
      setArea("");
      await load();
    }
    setSubmitting(false);
  }

  async function toggleActive(c: Community) {
    const { error } = await supabase
      .from("communities")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);

    if (error) {
      addToast("danger", "Update failed", error.message);
    } else {
      addToast("success", `Community ${c.is_active ? "deactivated" : "activated"}`);
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this community?")) return;

    const { error } = await supabase.from("communities").delete().eq("id", id);
    if (error) {
      addToast("danger", "Delete failed", error.message);
    } else {
      addToast("success", "Community deleted");
      await load();
    }
  }

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
            <p className="text-muted" style={{ marginBottom: 24 }}>Admin access required.</p>
            <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title" data-testid="communities-title">Manage Communities</h1>
          <p className="page-subtitle">Add and manage gated communities for fitness classes.</p>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="pill">← Back</Link>
          <Link href="/admin/communities" className="pill pill-active">Communities</Link>
          <Link href="/admin/class-types" className="pill">Class Types</Link>
          <Link href="/admin/sessions" className="pill">Sessions</Link>
          <Link href="/admin/payments" className="pill">Payments</Link>
        </nav>

        <div className="card mb-6">
          <h3 className="card-title">Add Community</h3>
          <form onSubmit={addCommunity} className="form" style={{ marginTop: 16 }}>
            <div className="form-row form-row-2">
              <div className="field">
                <label className="field-label">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Green Valley Apartments"
                  required
                  data-testid="input-community-name"
                />
              </div>
              <div className="field">
                <label className="field-label">Area (optional)</label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., Whitefield"
                  data-testid="input-community-area"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-testid="add-community-btn"
              >
                {submitting ? "Adding..." : "Add Community"}
              </button>
            </div>
          </form>
        </div>

        {loadingData ? (
          <div className="table-wrapper">
            <SkeletonTableRows rows={5} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🏘️"
            title="No communities yet"
            message="Add your first community to get started."
          />
        ) : (
          <div className="table-wrapper" data-testid="communities-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} data-testid={`community-${c.id}`}>
                    <td>{c.name}</td>
                    <td className="td-muted">{c.area ?? "—"}</td>
                    <td>
                      <span className={`badge ${c.is_active ? "badge-success" : "badge-danger"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => toggleActive(c)}
                        data-testid={`toggle-${c.id}`}
                      >
                        {c.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(c.id)}
                        style={{ marginLeft: 8 }}
                        data-testid={`delete-${c.id}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
