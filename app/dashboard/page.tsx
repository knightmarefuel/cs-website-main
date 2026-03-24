"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/app/providers";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonSessionCards } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import type { ClassSession, ClassType, Booking, PaymentSubmission, LeadType } from "@/lib/types";

type SessionWithDetails = ClassSession & {
  class_types?: ClassType;
  bookings?: { count: number }[];
};

type DateFilter = "today" | "week" | "all";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const { addToast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<"sessions" | "bookings" | "payments">("sessions");
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [myBookings, setMyBookings] = useState<(Booking & { class_sessions: ClassSession & { class_types?: ClassType } })[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentSubmission[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilter>("week");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentUpiRef, setPaymentUpiRef] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Lead form (for users without community)
  const [leadType, setLeadType] = useState<LeadType>("personal_training");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");

  const needsOnboarding = useMemo(() => !!session && !profile, [session, profile]);
  const hasCommunity = !!profile?.community_id;

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && needsOnboarding) router.push("/onboarding");
  }, [loading, session, needsOnboarding, router]);

  // Load data
  useEffect(() => {
    if (!profile) return;

    async function loadData() {
      setLoadingData(true);

      // Load class types
      const { data: typesData } = await supabase
        .from("class_types")
        .select("*")
        .order("name");
      if (typesData) setClassTypes(typesData as ClassType[]);

      const communityId = profile?.community_id;
      if (communityId) {
        // Calculate date range
        const now = new Date();
        let startDate = now.toISOString();
        let endDate: string | null = null;

        if (dateFilter === "today") {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          endDate = tomorrow.toISOString();
        } else if (dateFilter === "week") {
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          endDate = nextWeek.toISOString();
        }

        // Load sessions with booking count
        let query = supabase
          .from("class_sessions")
          .select("*, class_types(*), bookings:bookings(count)")
          .eq("community_id", communityId)
          .eq("status", "scheduled")
          .gte("start_time", startDate)
          .order("start_time", { ascending: true });

        if (endDate) {
          query = query.lte("start_time", endDate);
        }

        const { data: sessionsData, error: sessionsError } = await query;
        if (sessionsError) {
          console.error("Sessions error:", sessionsError);
        } else {
          setSessions((sessionsData as SessionWithDetails[]) ?? []);
        }

        // Load my bookings
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*, class_sessions(*, class_types(*))")
          .eq("client_id", profile?.id)
          .order("booked_at", { ascending: false })
          .limit(20);
        if (bookingsData) setMyBookings(bookingsData as any);

        // Load my payments
        const { data: paymentsData } = await supabase
          .from("payment_submissions")
          .select("*")
          .eq("client_id", profile?.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (paymentsData) setMyPayments(paymentsData as PaymentSubmission[]);
      }

      setLoadingData(false);
    }

    loadData();
  }, [profile, dateFilter]);

  // Filter sessions by type
  const filteredSessions = useMemo(() => {
    if (typeFilter === "all") return sessions;
    return sessions.filter((s) => s.class_type_id === typeFilter);
  }, [sessions, typeFilter]);

  // Book a session
  async function handleBook(sessionId: string) {
    if (!profile) return;

    const { error } = await supabase.from("bookings").insert({
      session_id: sessionId,
      client_id: profile.id,
      status: "reserved",
      booked_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === "23505") {
        addToast("warning", "Already booked", "You've already booked this session");
      } else {
        addToast("danger", "Booking failed", error.message);
      }
      return;
    }

    addToast("success", "Session booked!", "See you there!");
    
    // Refresh sessions to update counts
    const { data: newSessions } = await supabase
      .from("class_sessions")
      .select("*, class_types(*), bookings:bookings(count)")
      .eq("community_id", profile.community_id)
      .eq("status", "scheduled")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true });
    if (newSessions) setSessions(newSessions as SessionWithDetails[]);

    // Refresh bookings
    const { data: newBookings } = await supabase
      .from("bookings")
      .select("*, class_sessions(*, class_types(*))")
      .eq("client_id", profile.id)
      .order("booked_at", { ascending: false })
      .limit(20);
    if (newBookings) setMyBookings(newBookings as any);
  }

  // Cancel booking
  async function handleCancelBooking(bookingId: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      addToast("danger", "Cancel failed", error.message);
      return;
    }

    addToast("success", "Booking cancelled");
    setMyBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
  }

  // Submit payment
  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !paymentFile) return;

    setSubmittingPayment(true);
    setUploadProgress(0);

    try {
      // Upload file
      const timestamp = Date.now();
      const safeName = paymentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `payments/${profile.id}/${timestamp}-${safeName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, paymentFile);

      if (uploadError) {
        addToast("danger", "Upload failed", uploadError.message);
        setSubmittingPayment(false);
        return;
      }

      setUploadProgress(70);

      // Create payment record
      const { error: insertError } = await supabase.from("payment_submissions").insert({
        client_id: profile.id,
        amount: parseFloat(paymentAmount),
        upi_ref: paymentUpiRef || null,
        session_id: paymentSessionId || null,
        community_id: profile.community_id,
        screenshot_path: path,
        status: "pending",
      });

      if (insertError) {
        addToast("danger", "Submission failed", insertError.message);
        setSubmittingPayment(false);
        return;
      }

      setUploadProgress(100);
      addToast("success", "Payment submitted!", "Admin will review your submission");

      // Reset form
      setPaymentAmount("");
      setPaymentUpiRef("");
      setPaymentFile(null);
      setPaymentSessionId("");
      setShowPaymentForm(false);

      // Refresh payments
      const { data: newPayments } = await supabase
        .from("payment_submissions")
        .select("*")
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (newPayments) setMyPayments(newPayments as PaymentSubmission[]);
    } finally {
      setSubmittingPayment(false);
      setUploadProgress(0);
    }
  }

  // Submit lead (for users without community)
  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const { error } = await supabase.from("leads").insert({
      client_id: profile.id,
      type: leadType,
      preferred_time: preferredTime || null,
      message: message || null,
    });

    if (error) {
      addToast("danger", "Submission failed", error.message);
      return;
    }

    setPreferredTime("");
    setMessage("");
    addToast("success", "Request submitted", "Admin will contact you soon");
  }

  if (loading || !profile) {
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

  return (
    <AppShell>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title" data-testid="dashboard-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {profile.full_name}! Manage your bookings and payments.
          </p>
        </div>

        {hasCommunity ? (
          <>
            {/* Tabs */}
            <div className="tabs" data-testid="dashboard-tabs">
              <button
                className={`tab ${activeTab === "sessions" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("sessions")}
                data-testid="tab-sessions"
              >
                Sessions
              </button>
              <button
                className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("bookings")}
                data-testid="tab-bookings"
              >
                My Bookings ({myBookings.filter((b) => b.status === "confirmed").length})
              </button>
              <button
                className={`tab ${activeTab === "payments" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("payments")}
                data-testid="tab-payments"
              >
                Payments ({myPayments.length})
              </button>
            </div>

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <>
                <div className="filter-bar" data-testid="filter-bar">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      data-testid="filter-date"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="all">All Upcoming</option>
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">Class Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      data-testid="filter-type"
                    >
                      <option value="all">All Types</option>
                      {classTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingData ? (
                  <SkeletonSessionCards count={4} />
                ) : filteredSessions.length === 0 ? (
                  <EmptyState
                    icon="📅"
                    title="No sessions found"
                    message="No upcoming sessions match your filters. Try changing the date range or class type."
                  />
                ) : (
                  <div className="grid grid-2">
                    {filteredSessions.map((s) => {
                      const bookedCount = s.bookings?.[0]?.count ?? 0;
                      const remaining = s.capacity - bookedCount;
                      const isFull = remaining <= 0;
                      const isLow = remaining > 0 && remaining <= 3;
                      const alreadyBooked = myBookings.some(
                        (b) => b.session_id === s.id && b.status === "confirmed"
                      );

                      return (
                        <div key={s.id} className="session-card" data-testid={`session-${s.id}`}>
                          <div className="session-header">
                            <div>
                              <p className="session-time">
                                {formatDate(s.start_time)} • {formatTime(s.start_time)} - {formatTime(s.end_time)}
                              </p>
                              <h3 className="session-type">
                                {s.class_types?.name || "Class"}
                              </h3>
                            </div>
                            <span className={`badge ${isFull ? "badge-danger" : isLow ? "badge-warning" : "badge-success"}`}>
                              {isFull ? "Full" : `${remaining} spots`}
                            </span>
                          </div>
                          <div className="session-meta">
                            <span>Capacity: {s.capacity}</span>
                            {s.notes && <span>• {s.notes}</span>}
                          </div>
                          <div style={{ marginTop: 12 }}>
                            {alreadyBooked ? (
                              <span className="badge badge-gold">Booked</span>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleBook(s.id)}
                                disabled={isFull}
                                data-testid={`book-${s.id}`}
                              >
                                {isFull ? "Session Full" : "Book Now"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <>
                {myBookings.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No bookings yet"
                    message="Book your first session to get started!"
                    action={
                      <button className="btn btn-primary" onClick={() => setActiveTab("sessions")}>
                        Browse Sessions
                      </button>
                    }
                  />
                ) : (
                  <div className="list" data-testid="bookings-list">
                    {myBookings.map((b) => (
                      <div key={b.id} className="list-item">
                        <div className="list-item-content">
                          <div className="list-item-title">
                            {b.class_sessions?.class_types?.name || "Session"}
                          </div>
                          <div className="list-item-meta">
                            {formatDate(b.class_sessions.start_time)} • {formatTime(b.class_sessions.start_time)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${
                            b.status === "confirmed" ? "badge-success" :
                            b.status === "cancelled" ? "badge-danger" :
                            b.status === "attended" ? "badge-gold" : "badge-warning"
                          }`}>
                            {b.status}
                          </span>
                          {b.status === "confirmed" && new Date(b.class_sessions.start_time) > new Date() && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelBooking(b.id)}
                              data-testid={`cancel-${b.id}`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-title" style={{ margin: 0 }}>Payment Submissions</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    data-testid="toggle-payment-form"
                  >
                    {showPaymentForm ? "Cancel" : "+ Submit Payment"}
                  </button>
                </div>

                {showPaymentForm && (
                  <div className="card card-gold mb-6" data-testid="payment-form">
                    <h4 style={{ marginBottom: 16 }}>Submit Payment Proof</h4>
                    <form onSubmit={handlePaymentSubmit} className="form">
                      <div className="form-row form-row-2">
                        <div className="field">
                          <label className="field-label">Amount (₹) *</label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="500"
                            required
                            min="1"
                            data-testid="payment-amount"
                          />
                        </div>
                        <div className="field">
                          <label className="field-label">UPI Reference (optional)</label>
                          <input
                            type="text"
                            value={paymentUpiRef}
                            onChange={(e) => setPaymentUpiRef(e.target.value)}
                            placeholder="e.g., 123456789012"
                            data-testid="payment-upi"
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Related Session (optional)</label>
                        <select
                          value={paymentSessionId}
                          onChange={(e) => setPaymentSessionId(e.target.value)}
                          data-testid="payment-session"
                        >
                          <option value="">Not linked to specific session</option>
                          {myBookings
                            .filter((b) => b.status === "confirmed")
                            .map((b) => (
                              <option key={b.session_id} value={b.session_id}>
                                {b.class_sessions?.class_types?.name} - {formatDate(b.class_sessions.start_time)}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="field">
                        <label className="field-label">Payment Screenshot *</label>
                        <div className="file-input-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            className="file-input"
                            onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                            required
                            data-testid="payment-file"
                          />
                          <div className="file-input-display">
                            {paymentFile ? (
                              <p><span className="highlight">{paymentFile.name}</span></p>
                            ) : (
                              <p>Click or drag to upload <span className="highlight">payment screenshot</span></p>
                            )}
                          </div>
                        </div>
                      </div>

                      {uploadProgress > 0 && (
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-solid"
                        disabled={submittingPayment || !paymentFile}
                        data-testid="submit-payment"
                      >
                        {submittingPayment ? "Uploading..." : "Submit Payment"}
                      </button>
                    </form>
                  </div>
                )}

                {myPayments.length === 0 ? (
                  <EmptyState
                    icon="💳"
                    title="No payments submitted"
                    message="Submit your first payment proof after making a UPI transfer."
                  />
                ) : (
                  <div className="list" data-testid="payments-list">
                    {myPayments.map((p) => (
                      <div key={p.id} className="list-item">
                        <div className="list-item-content">
                          <div className="list-item-title">₹{p.amount}</div>
                          <div className="list-item-meta">
                            {new Date(p.created_at).toLocaleDateString("en-IN")}
                            {p.upi_ref && ` • Ref: ${p.upi_ref}`}
                          </div>
                          {p.admin_note && (
                            <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                              Note: {p.admin_note}
                            </div>
                          )}
                        </div>
                        <span className={`badge ${
                          p.status === "approved" ? "badge-success" :
                          p.status === "rejected" ? "badge-danger" : "badge-warning"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* No community - show lead form */
          <div className="card" style={{ maxWidth: 600 }}>
            <h3 className="card-title">Your Community Isn't Listed</h3>
            <p className="card-description mb-4">
              Submit a request for personal training or starting a new class at your community.
            </p>

            <form onSubmit={submitLead} className="form">
              <div className="field">
                <label className="field-label">Request Type</label>
                <select
                  value={leadType}
                  onChange={(e) => setLeadType(e.target.value as LeadType)}
                  data-testid="lead-type"
                >
                  <option value="personal_training">Personal Training</option>
                  <option value="new_community_class">Start New Community Class</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">Preferred Time (optional)</label>
                <input
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g., Weekdays 7pm"
                  data-testid="lead-time"
                />
              </div>

              <div className="field">
                <label className="field-label">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any additional details..."
                  data-testid="lead-message"
                />
              </div>

              <button type="submit" className="btn btn-primary" data-testid="submit-lead">
                Submit Request
              </button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
