"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/app/providers";

export default function AdminHome() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.push("/auth/sign-in");
    if (!loading && session && !profile) router.push("/onboarding");
    if (!loading && profile && profile.role !== "admin") router.push("/dashboard");
  }, [loading, session, profile, router]);

  return (
    <main className="container">
      <Nav />
      <div className="card">
        <h2>Admin</h2>
        <p>Manage communities, class types and sessions.</p>

        <ul>
          <li><a href="/admin/communities">Manage Communities</a></li>
          <li><a href="/admin/class-types">Manage Class Types</a></li>
          <li><a href="/admin/sessions">Manage Class Sessions</a></li>
        </ul>

        <p className="small">
          Note: to make the founder an admin, update their role in <code>profiles</code> to <code>admin</code>.
        </p>
      </div>
    </main>
  );
}
