"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import type { ClassSession, Community, ClassType, Profile } from "@/lib/types";

function toDatetimeLocalValue(iso: string) {
  // Convert ISO -> YYYY-MM-DDTHH:mm for <input type="datetime-local">
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function AdminSessions() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const [msg, setMsg] = useState<string | null>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [types, setTypes] = useState<ClassType[]>([]);
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  // form fields
  const [communityId, setCommunityId] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [trainerId, setTrainerId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(30);
  const [status, setStatus] = useState<ClassSession["status"]>("scheduled");
  const [notes, setNotes] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!session || !profile)) return;
    if (!loading && profile && profile.role !== "admin") router.push("/dashboard");
  }, [loading, session, profile, router]);

  async function loadAll() {
    setMsg(null);

    const [cRes, tRes, trRes, sRes] = await Promise.all([
      supabase.from("communities").select("*").order("name", { ascending: true }),
      supabase.from("class_types").select("*").order("name", { ascending: true }),
      supabase.from("profiles").select("*").eq("role", "trainer").order("full_name", { ascending: true }),
      supabase.from("class_sessions").select("*").order("start_time", { ascending: false }).limit(200)
    ]);

    if (cRes.error) return setMsg(cRes.error.message);
    if (tRes.error) return setMsg(tRes.error.message);
    // trainer list may be empty; error only if policy blocks
    if (trRes.error) console.warn("Trainer load:", trRes.error.message);
    if (sRes.error) return setMsg(sRes.error.message);

    setCommunities((cRes.data as Community[]) ?? []);
    setTypes((tRes.data as ClassType[]) ?? []);
    setTrainers((trRes.data as Profile[]) ?? []);
    setSessions((sRes.data as ClassSession[]) ?? []);
  }

  useEffect(() => { if (profile?.role === "admin") loadAll(); }, [profile]);

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
    setMsg(null);

    if (!communityId || !typeId || !startTime || !endTime) {
      setMsg("Community, class type, start time and end time are required.");
      return;
    }

    const payload = {
      community_id: communityId,
      class_type_id: typeId,
      trainer_id: trainerId || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      capacity,
      status,
      notes: notes.trim() || null
    };

    if (editingId) {
      const { error } = await supabase.from("class_sessions").update(payload).eq("id", editingId);
      if (error) return setMsg(error.message);
    } else {
      const { error } = await supabase.from("class_sessions").insert(payload);
      if (error) return setMsg(error.message);
    }

    resetForm();
    await loadAll();
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
  }

  async function remove(id: string) {
    setMsg(null);
    const { error } = await supabase.from("class_sessions").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await loadAll();
  }

  const communityName = useMemo(() => {
    const m = new Map(communities.map(c => [c.id, c.name]));
    return (id: string | null) => (id ? (m.get(id) ?? "—") : "—");
  }, [communities]);

  const typeName = useMemo(() => {
    const m = new Map(types.map(t => [t.id, t.name]));
    return (id: string) => (m.get(id) ?? "—");
  }, [types]);

  return (
    <main className="container">
      <Nav />
      <div className="card">
        <h2>Manage Class Sessions</h2>
        <p className="small">Add, edit, and delete sessions. Times are stored in UTC internally.</p>
        {msg && <p className="error">{msg}</p>}

        <form onSubmit={save} className="card">
          <h3>{editingId ? "Edit session" : "Add session"}</h3>

          <div className="row">
            <div className="col">
              <label>Community</label>
              <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} required>
                <option value="" disabled>Select community</option>
                {communities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col">
              <label>Class type</label>
              <select value={typeId} onChange={(e) => setTypeId(e.target.value)} required>
                <option value="" disabled>Select type</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="col">
              <label>Trainer (optional)</label>
              <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
                <option value="">— none —</option>
                {trainers.map(tr => (
                  <option key={tr.id} value={tr.id}>{tr.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ height: 10 }} />

          <div className="row">
            <div className="col">
              <label>Start time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="col">
              <label>End time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="col">
              <label>Capacity</label>
              <input type="number" value={capacity} min={1} onChange={(e) => setCapacity(parseInt(e.target.value || "30", 10))} />
            </div>
          </div>

          <div style={{ height: 10 }} />

          <div className="row">
            <div className="col">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="scheduled">scheduled</option>
                <option value="cancelled">cancelled</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <div className="col">
              <label>Notes (optional)</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Bring water, warm-up included" />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <button type="submit">{editingId ? "Update session" : "Create session"}</button>
          {editingId && (
            <button type="button" className="danger" onClick={resetForm} style={{ marginLeft: 10 }}>
              Cancel edit
            </button>
          )}
        </form>

        <div style={{ height: 14 }} />
        <table className="table">
          <thead>
            <tr>
              <th>Community</th>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Cap.</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td>{communityName(s.community_id)}</td>
                <td>{typeName(s.class_type_id)}</td>
                <td className="small">{new Date(s.start_time).toLocaleString()}</td>
                <td className="small">{new Date(s.end_time).toLocaleString()}</td>
                <td><span className="badge">{s.status}</span></td>
                <td>{s.capacity}</td>
                <td className="small">{s.notes ?? "-"}</td>
                <td>
                  <button onClick={() => startEdit(s)} style={{ marginRight: 8 }}>Edit</button>
                  <button className="danger" onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}
