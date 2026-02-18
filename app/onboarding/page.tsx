"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/providers";
import type { Community } from "@/lib/types";

export default function Onboarding() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [communityId, setCommunityId] = useState<string>("");
  const [communityOther, setCommunityOther] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const showOther = useMemo(() => communityId === "__other__", [communityId]);

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && profile) router.push("/dashboard");
  }, [loading, session, profile, router]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!error && data) setCommunities(data as Community[]);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!session?.user?.id) {
      setMsg("Not signed in.");
      return;
    }

    const payload = {
      id: session.user.id,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      community_id: showOther ? null : (communityId || null),
      community_other: showOther ? (communityOther.trim() || null) : null,
      medical_notes: medicalNotes.trim() || null,
      role: "client" as const
    };

    if (!payload.full_name) {
      setMsg("Full name is required.");
      return;
    }

    // Insert profile (requires profiles_insert_own policy)
    const { error } = await supabase.from("profiles").insert(payload);
    if (error) {
      setMsg(error.message);
      return;
    }

    await refreshProfile();
    router.push("/dashboard");
  }

  return (
    <main className="container">
      <Nav />
      <div className="card" style={{ maxWidth: 720 }}>
        <h2>Onboarding</h2>
        <p>Tell us your details so we can show classes available in your community.</p>

        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="col">
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="col">
              <label>Phone (optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 9XXXXXXXXX" />
            </div>
          </div>

          <div style={{ height: 10 }} />

          <label>Community</label>
          <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} required>
            <option value="" disabled>Select your community</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="__other__">My community is not listed</option>
          </select>

          {showOther && (
            <>
              <div style={{ height: 10 }} />
              <label>Enter your community name</label>
              <input value={communityOther} onChange={(e) => setCommunityOther(e.target.value)} required />
            </>
          )}

          <div style={{ height: 10 }} />
          <label>Medical notes (optional)</label>
          <textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} />

          <div style={{ height: 14 }} />
          <button type="submit">Save & Continue</button>

          {msg && <p className="error" style={{ marginTop: 10 }}>{msg}</p>}
        </form>
      </div>
    </main>
  );
}
