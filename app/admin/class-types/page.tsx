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
import type { ClassType } from "@/lib/types";

export default function AdminClassTypes() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState<ClassType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized = profile?.role === "admin";

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
  }, [loading, session, profile, router]);

  async function load() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("class_types")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      addToast("danger", "Failed to load class types", error.message);
    } else {
      setItems((data as ClassType[]) ?? []);
    }
    setLoadingData(false);
  }

  useEffect(() => {
    if (isAuthorized) load();
  }, [isAuthorized]);

  async function addType(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("class_types").insert({
      name: name.trim(),
      description: desc.trim() || null,
    });

    if (error) {
      addToast("danger", "Failed to add class type", error.message);
    } else {
      addToast("success", "Class type added");
      setName("");
      setDesc("");
      await load();
    }
    setSubmitting(false);
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this class type?")) return;

    const { error } = await supabase.from("class_types").delete().eq("id", id);
    if (error) {
      addToast("danger", "Delete failed", error.message);
    } else {
      addToast("success", "Class type deleted");
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
          <h1 className="page-title" data-testid="classtypes-title">Manage Class Types</h1>
          <p className="page-subtitle">Define the types of fitness classes you offer.</p>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="pill">← Back</Link>
          <Link href="/admin/communities" className="pill">Communities</Link>
          <Link href="/admin/class-types" className="pill pill-active">Class Types</Link>
          <Link href="/admin/sessions" className="pill">Sessions</Link>
          <Link href="/admin/payments" className="pill">Payments</Link>
        </nav>

        <div className="card mb-6">
          <h3 className="card-title">Add Class Type</h3>
          <form onSubmit={addType} className="form" style={{ marginTop: 16 }}>
            <div className="field">
              <label className="field-label">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Yoga, HIIT, Zumba"
                required
                data-testid="input-classtype-name"
              />
            </div>
            <div className="field">
              <label className="field-label">Description (optional)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description of this class type..."
                data-testid="input-classtype-desc"
              />
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-testid="add-classtype-btn"
              >
                {submitting ? "Adding..." : "Add Class Type"}
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
            icon="🏋️"
            title="No class types yet"
            message="Add your first class type to get started."
          />
        ) : (
          <div className="table-wrapper" data-testid="classtypes-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} data-testid={`classtype-${t.id}`}>
                    <td>{t.name}</td>
                    <td className="td-muted">{t.description ?? "—"}</td>
                    <td className="td-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(t.id)}
                        data-testid={`delete-${t.id}`}
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
