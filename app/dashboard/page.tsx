"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import type { ClassSession, LeadType } from "@/lib/types";

function fmt(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function Dashboard() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // lead form
  const [leadType, setLeadType] = useState<LeadType>("personal_training");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");

  const needsOnboarding = useMemo(() => !!session && !profile, [session, profile]);

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && needsOnboarding) router.push("/onboarding");
  }, [loading, session, needsOnboarding, router]);

  useEffect(() => {
    if (!profile) return;

    (async () => {
      setMsg(null);

      if (!profile.community_id) {
        setSessions([]);
        return;
      }

      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("class_sessions")
        .select("*")
        .eq("community_id", profile.community_id)
        .gte("start_time", nowIso)
        .order("start_time", { ascending: true })
        .limit(25);

      if (error) {
        setMsg(error.message);
        return;
      }
      setSessions((data as ClassSession[]) ?? []);
    })();
  }, [profile]);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!profile) return;

    const { error } = await supabase.from("leads").insert({
      client_id: profile.id,
      type: leadType,
      preferred_time: preferredTime || null,
      message: message || null
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setPreferredTime("");
    setMessage("");
    setMsg("Request submitted. Admin will contact you.");
  }

  return (
    <main className="container">
      <Nav />

      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome to Vitamin F3.</p>

        {msg && <p className={msg.startsWith("Request") ? "success" : "error"}>{msg}</p>}

        {profile?.community_id ? (
          <>
            <h3>Upcoming sessions (your community)</h3>
            {sessions.length === 0 ? (
              <p>No upcoming sessions found. Please check later or contact admin.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Capacity</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{fmt(s.start_time)}</td>
                      <td>{fmt(s.end_time)}</td>
                      <td><span className="badge">{s.status}</span></td>
                      <td>{s.capacity}</td>
                      <td className="small">{s.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            <h3>Your community isn’t listed</h3>
            <p>Submit a request for personal training or starting a new class at your community.</p>

            <form onSubmit={submitLead} className="card">
              <label>Request type</label>
              <select value={leadType} onChange={(e) => setLeadType(e.target.value as LeadType)}>
                <option value="personal_training">Personal training</option>
                <option value="new_community_class">Start new community class</option>
              </select>

              <div style={{ height: 10 }} />
              <label>Preferred time (optional)</label>
              <input value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g., Weekdays 7pm" />

              <div style={{ height: 10 }} />
              <label>Message (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any details…" />

              <div style={{ height: 14 }} />
              <button type="submit">Submit request</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
