"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/providers";
import { useToast } from "@/components/Toast";
import type { Community } from "@/lib/types";

export default function Onboarding() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [communityId, setCommunityId] = useState<string>("");
  const [communityOther, setCommunityOther] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    if (!session?.user?.id) {
      setError("Not signed in.");
      return;
    }

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSubmitting(true);

    const payload = {
      id: session.user.id,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      community_id: showOther ? null : (communityId || null),
      community_other: showOther ? (communityOther.trim() || null) : null,
      medical_notes: medicalNotes.trim() || null,
      role: "client" as const
    };

    const { error: insertError } = await supabase.from("profiles").insert(payload);
    
    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    addToast("success", "Profile created!", "Welcome to Vitamin F3");
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <div className="card">
          <div className="auth-header" style={{ textAlign: "left" }}>
            <Link href="/" className="auth-logo" style={{ margin: "0 0 20px" }} data-testid="auth-logo">F3</Link>
            <h1 className="auth-title">Complete Your Profile</h1>
            <p className="auth-subtitle">
              Tell us about yourself so we can show fitness classes available in your community.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" data-testid="onboarding-error">
              <div className="alert-content">
                <div className="alert-title">Error</div>
                <div className="alert-message">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="form">
            <div className="form-row form-row-2">
              <div className="field">
                <label className="field-label" htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  data-testid="input-fullname"
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9XXXXXXXXX"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="community">Your Community *</label>
              <select
                id="community"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                required
                data-testid="select-community"
              >
                <option value="" disabled>Select your community</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.area ? `(${c.area})` : ""}</option>
                ))}
                <option value="__other__">My community is not listed</option>
              </select>
            </div>

            {showOther && (
              <div className="field">
                <label className="field-label" htmlFor="communityOther">Enter Your Community Name *</label>
                <input
                  id="communityOther"
                  value={communityOther}
                  onChange={(e) => setCommunityOther(e.target.value)}
                  placeholder="e.g., Green Valley Apartments"
                  required
                  data-testid="input-community-other"
                />
                <span className="field-hint">We'll add your community soon!</span>
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="medicalNotes">Medical Notes (optional)</label>
              <textarea
                id="medicalNotes"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Any health conditions the trainer should know about..."
                data-testid="input-medical"
              />
              <span className="field-hint">This info is kept confidential and helps trainers personalize your sessions.</span>
            </div>

            <button
              type="submit"
              className="btn btn-solid w-full"
              disabled={submitting}
              data-testid="submit-onboarding"
            >
              {submitting ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
