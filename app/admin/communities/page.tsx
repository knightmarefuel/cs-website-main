"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import type { Community } from "@/lib/types";

export default function AdminCommunities() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const [items, setItems] = useState<Community[]>([]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!session || !profile)) return;
    if (!loading && profile && profile.role !== "admin") router.push("/dashboard");
  }, [loading, session, profile, router]);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("name", { ascending: true });

    if (error) return setMsg(error.message);
    setItems((data as Community[]) ?? []);
  }

  useEffect(() => { if (profile?.role === "admin") load(); }, [profile]);

  async function addCommunity(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.from("communities").insert({
      name: name.trim(),
      area: area.trim() || null,
      is_active: true
    });
    if (error) return setMsg(error.message);
    setName(""); setArea("");
    await load();
  }

  async function toggleActive(c: Community) {
    setMsg(null);
    const { error } = await supabase
      .from("communities")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) return setMsg(error.message);
    await load();
  }

  async function remove(id: string) {
    setMsg(null);
    const { error } = await supabase.from("communities").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }

  return (
    <main className="container">
      <Nav />
      <div className="card">
        <h2>Manage Communities</h2>
        {msg && <p className="error">{msg}</p>}

        <form onSubmit={addCommunity} className="card">
          <h3>Add community</h3>
          <div className="row">
            <div className="col">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col">
              <label>Area (optional)</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>
          <div style={{ height: 12 }} />
          <button type="submit">Add</button>
        </form>

        <div style={{ height: 10 }} />
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Area</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="small">{c.area ?? "-"}</td>
                <td><span className={`badge ${c.is_active ? "ok" : "danger"}`}>{c.is_active ? "active" : "inactive"}</span></td>
                <td>
                  <button onClick={() => toggleActive(c)} style={{ marginRight: 8 }}>
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="danger" onClick={() => remove(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}
