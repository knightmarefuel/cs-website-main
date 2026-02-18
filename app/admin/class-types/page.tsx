"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import type { ClassType } from "@/lib/types";

export default function AdminClassTypes() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const [items, setItems] = useState<ClassType[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!session || !profile)) return;
    if (!loading && profile && profile.role !== "admin") router.push("/dashboard");
  }, [loading, session, profile, router]);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase
      .from("class_types")
      .select("*")
      .order("name", { ascending: true });
    if (error) return setMsg(error.message);
    setItems((data as ClassType[]) ?? []);
  }

  useEffect(() => { if (profile?.role === "admin") load(); }, [profile]);

  async function addType(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.from("class_types").insert({
      name: name.trim(),
      description: desc.trim() || null
    });
    if (error) return setMsg(error.message);
    setName(""); setDesc("");
    await load();
  }

  async function remove(id: string) {
    setMsg(null);
    const { error } = await supabase.from("class_types").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }

  return (
    <main className="container">
      <Nav />
      <div className="card">
        <h2>Manage Class Types</h2>
        {msg && <p className="error">{msg}</p>}

        <form onSubmit={addType} className="card">
          <h3>Add class type</h3>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <div style={{ height: 10 }} />
          <label>Description (optional)</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div style={{ height: 12 }} />
          <button type="submit">Add</button>
        </form>

        <div style={{ height: 10 }} />
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td className="small">{t.description ?? "-"}</td>
                <td>
                  <button className="danger" onClick={() => remove(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}
