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
import type { PaymentWithProfile, PaymentStatus } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPayments() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const { addToast } = useToast();

  const [payments, setPayments] = useState<PaymentWithProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("pending");
  
  // Review modal state
  const [reviewing, setReviewing] = useState<PaymentWithProfile | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthorized = profile?.role === "admin";

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
  }, [loading, session, profile, router]);

  async function load() {
    setLoadingData(true);
    
    let query = supabase
      .from("payment_submissions")
      .select("*, profiles!payment_submissions_client_id_fkey(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      addToast("danger", "Failed to load payments", error.message);
    } else {
      setPayments((data as PaymentWithProfile[]) ?? []);
    }
    setLoadingData(false);
  }

  useEffect(() => {
    if (isAuthorized) load();
  }, [isAuthorized, statusFilter]);

  async function handleReview(newStatus: PaymentStatus) {
    if (!reviewing || !profile) return;

    setSubmitting(true);

    const { error } = await supabase
      .from("payment_submissions")
      .update({
        status: newStatus,
        admin_note: adminNote.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile.id,
      })
      .eq("id", reviewing.id);

    if (error) {
      addToast("danger", "Update failed", error.message);
    } else {
      addToast("success", `Payment ${newStatus}`);
      setReviewing(null);
      setAdminNote("");
      await load();
    }

    setSubmitting(false);
  }

  function openReview(p: PaymentWithProfile) {
    setReviewing(p);
    setAdminNote(p.admin_note || "");
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
          <h1 className="page-title" data-testid="payments-title">Payment Submissions</h1>
          <p className="page-subtitle">Review and approve payment proofs from members.</p>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="pill">← Back</Link>
          <Link href="/admin/communities" className="pill">Communities</Link>
          <Link href="/admin/class-types" className="pill">Class Types</Link>
          <Link href="/admin/sessions" className="pill">Sessions</Link>
          <Link href="/admin/payments" className="pill pill-active">Payments</Link>
        </nav>

        <div className="filter-bar">
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
              data-testid="filter-status"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {loadingData ? (
          <div className="table-wrapper">
            <SkeletonTableRows rows={5} />
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No payments found"
            message={statusFilter === "pending" ? "No pending payments to review." : "No payments match the current filter."}
          />
        ) : (
          <div className="table-wrapper" data-testid="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>UPI Ref</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} data-testid={`payment-${p.id}`}>
                    <td>
                      <div>{p.profiles?.full_name || "Unknown"}</div>
                      {p.profiles?.phone && (
                        <div className="text-xs text-muted">{p.profiles.phone}</div>
                      )}
                    </td>
                    <td className="font-semibold">₹{p.amount}</td>
                    <td className="td-muted">{p.upi_ref || "—"}</td>
                    <td className="td-muted">{formatDate(p.created_at)}</td>
                    <td>
                      <span className={`badge ${
                        p.status === "approved" ? "badge-success" :
                        p.status === "rejected" ? "badge-danger" : "badge-warning"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openReview(p)}
                        data-testid={`review-${p.id}`}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Modal */}
        {reviewing && (
          <div className="modal-overlay" onClick={() => setReviewing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="review-modal">
              <div className="modal-header">
                <h3 className="modal-title">Review Payment</h3>
                <button className="modal-close" onClick={() => setReviewing(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="card card-compact mb-4" style={{ background: "var(--bg-secondary)" }}>
                  <div className="grid grid-2" style={{ gap: 12 }}>
                    <div>
                      <div className="text-xs text-muted">Member</div>
                      <div className="font-semibold">{reviewing.profiles?.full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Amount</div>
                      <div className="font-semibold text-gold">₹{reviewing.amount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">UPI Reference</div>
                      <div>{reviewing.upi_ref || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Submitted</div>
                      <div>{formatDate(reviewing.created_at)}</div>
                    </div>
                  </div>
                </div>

                {reviewing.screenshot_path && (
                  <div className="mb-4">
                    <div className="text-xs text-muted mb-2">Screenshot</div>
                    <div className="card card-compact" style={{ textAlign: "center" }}>
                      <p className="text-sm text-muted">
                        File: {reviewing.screenshot_path.split("/").pop()}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        View in Supabase Storage → payment-proofs bucket
                      </p>
                    </div>
                  </div>
                )}

                <div className="field">
                  <label className="field-label">Admin Note (optional)</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add a note for this submission..."
                    data-testid="admin-note"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => handleReview("rejected")}
                  disabled={submitting}
                  data-testid="reject-btn"
                >
                  Reject
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleReview("approved")}
                  disabled={submitting}
                  data-testid="approve-btn"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
