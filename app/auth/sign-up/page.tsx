"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="container">
      <Nav />
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>Create account</h2>
        <p>Email + password sign up.</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <div style={{ height: 10 }} />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          <div style={{ height: 14 }} />
          <button type="submit">Sign Up</button>

          {msg && <p className="error" style={{ marginTop: 10 }}>{msg}</p>}
        </form>
      </div>
    </main>
  );
}
