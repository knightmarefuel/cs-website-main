"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/app/providers";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonTableRows } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import type { ClassSession, Community, ClassType, Profile } from "@/lib/types";

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSessions() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const { addToast } = useToast();

  const [loadingData, setLoadingData] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [types, setTypes] = useState<ClassType[]>([]);
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  // Form fields
  const [communityId, setCommunityId] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [trainerId, setTrainerId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(30);
  const [status, setStatus] = useState<ClassSession["status"]>("scheduled");
  const [notes, setNotes] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized = profile?.role === "admin";

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
  }, [loading, session, profile, router]);

  async function loadAll() {
    setLoadingData(true);

    const [cRes, tRes, trRes, sRes] = await Promise.all([
      supabase.from("communities").select("*").order("name", { ascending: true }),
      supabase.from("class_types").select("*").order("name", { ascending: true }),
      supabase.from("profiles").select("*").eq("role", "trainer").order("full_name", { ascending: true }),
      supabase.from("class_sessions").select("*").order("start_time", { ascending: false }).limit(200),
    ]);

    if (cRes.error) addToast("danger", "Failed to load communities");
    else setCommunities((cRes.data as Community[]) ?? []);

    if (tRes.error) addToast("danger", "Failed to load class types");
    else setTypes((tRes.data as ClassType[]) ?? []);

    if (!trRes.error) setTrainers((trRes.data as Profile[]) ?? []);

    if (sRes.error) addToast("danger", "Failed to load sessions");
    else setSessions((sRes.data as ClassSession[]) ?? []);

    setLoadingData(false);
  }

  useEffect(() => {
    if (isAuthorized) loadAll();
  }, [isAuthorized]);

  function resetForm() {
    setEditingId(null);
    setCommunityId("");
    setTypeId("");
    setTrainerId("");
    setStartTime("");
    setEndTime("");
    setCapacity(30);
    setStatus("scheduled");
    setNotes("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!communityId || !typeId || !startTime || !endTime) {
      addToast("warning", "Missing fields", "Community, class type, start and end time are required.");
      return;
    }

    setSubmitting(true);

    const payload = {
      community_id: communityId,
      class_type_id: typeId,
      trainer_id: trainerId || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      capacity,
      status,
      notes: notes.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase.from("class_sessions").update(payload).eq("id", editingId);
      if (error) {
        addToast("danger", "Update failed", error.message);
      } else {
        addToast("success", "Session updated");
        resetForm();
        await loadAll();
      }
    } else {
      const { error } = await supabase.from("class_sessions").insert(payload);
      if (error) {
        addToast("danger", "Create failed", error.message);
      } else {
        addToast("success", "Session created");
        resetForm();
        await loadAll();
      }
    }

    setSubmitting(false);
  }

  function startEdit(s: ClassSession) {
    setEditingId(s.id);
    setCommunityId(s.community_id ?? "");
    setTypeId(s.class_type_id);
    setTrainerId(s.trainer_id ?? "");
    setStartTime(toDatetimeLocalValue(s.start_time));
    setEndTime(toDatetimeLocalValue(s.end_time));
    setCapacity(s.capacity);
    setStatus(s.status);
    setNotes(s.notes ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this session?")) return;

    const { error } = await supabase.from("class_sessions").delete().eq("id", id);
    if (error) {
      addToast("danger", "Delete failed", error.message);
    } else {
      addToast("success", "Session deleted");
      await loadAll();
    }
  }

  const communityName = useMemo(() => {
    const m = new Map(communities.map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? m.get(id) ?? "—" : "—");
  }, [communities]);

  const typeName = useMemo(() => {
    const m = new Map(types.map((t) => [t.id, t.name]));
    return (id: string) => m.get(id) ?? "—";
  }, [types]);

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
          <h1 className="page-title" data-testid="sessions-title">Manage Sessions</h1>
          <p className="page-subtitle">Schedule and manage class sessions for each community.</p>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="pill">← Back</Link>
          <Link href="/admin/communities" className="pill">Communities</Link>
          <Link href="/admin/class-types" className="pill">Class Types</Link>
          <Link href="/admin/sessions" className="pill pill-active">Sessions</Link>
          <Link href="/admin/payments" className="pill">Payments</Link>
        </nav>

        <div className="card mb-6">
          <h3 className="card-title">{editingId ? "Edit Session" : "Create Session"}</h3>
          <form onSubmit={save} className="form" style={{ marginTop: 16 }}>
            <div className="form-row form-row-3">
              <div className="field">
                <label className="field-label">Community *</label>
                <select
                  value={communityId}
                  onChange={(e) => setCommunityId(e.target.value)}
                  required
                  data-testid="select-community"
                >
                  <option value="" disabled>Select community</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Class Type *</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                  data-testid="select-classtype"
                >
                  <option value="" disabled>Select type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Trainer (optional)</label>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  data-testid="select-trainer"
                >
                  <option value="">— none —</option>
                  {trainers.map((tr) => (
                    <option key={tr.id} value={tr.id}>{tr.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row form-row-3">
              <div className="field">
                <label className="field-label">Start Time *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  data-testid="input-start"
                />
              </div>
              <div className="field">
                <label className="field-label">End Time *</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  data-testid="input-end"
                />
              </div>
              <div className="field">
                <label className="field-label">Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  min={1}
                  onChange={(e) => setCapacity(parseInt(e.target.value || "30", 10))}
                  data-testid="input-capacity"
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="field">
                <label className="field-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClassSession["status"])}
                  data-testid="select-status"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Bring water, warm-up included"
                  data-testid="input-notes"
                />
              </div>
            </div>

            <div className="btn-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-testid="save-session-btn"
              >
                {submitting ? "Saving..." : editingId ? "Update Session" : "Create Session"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn"
                  onClick={resetForm}
                  data-testid="cancel-edit-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {loadingData ? (
          <div className="table-wrapper">
            <SkeletonTableRows rows={5} />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No sessions yet"
            message="Create your first session to get started."
          />
        ) : (
          <div className="table-wrapper" data-testid="sessions-table">
            <table>
              <thead>
                <tr>
                  <th>Community</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Cap.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} data-testid={`session-${s.id}`}>
                    <td>{communityName(s.community_id)}</td>
                    <td>{typeName(s.class_type_id)}</td>
                    <td className="td-muted">{formatDateTime(s.start_time)}</td>
                    <td className="td-muted">{formatDateTime(s.end_time)}</td>
                    <td>
                      <span className={`badge ${
                        s.status === "scheduled" ? "badge-success" :
                        s.status === "cancelled" ? "badge-danger" : "badge-info"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.capacity}</td>
                    <td className="td-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => startEdit(s)}
                        data-testid={`edit-${s.id}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(s.id)}
                        style={{ marginLeft: 8 }}
                        data-testid={`delete-${s.id}`}
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
