"use client";
// FILE: app/debug-lead/page.js
// TEMPORARY DEBUG PAGE — delete after fixing
// Visit: http://localhost:3000/debug-lead

import { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: "Test Lead",
          email: "test@gmail.com",
          phone: "03001234567",
          propertyInterest: "DHA Phase 6",
          budget: 50000,
          notes: "debug test",
        }),
      });

      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

      setResult({
        status: res.status,
        ok: res.ok,
        body: parsed,
      });
    } catch (err) {
      setResult({ fetchError: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setResult({ status: res.status, body: data });
    } catch (err) {
      setResult({ fetchError: err.message });
    } finally {
      setLoading(false);
    }
  };

  const box = {
    fontFamily: "monospace",
    background: "#0f172a",
    color: "#e2e8f0",
    padding: "2rem",
    minHeight: "100vh",
  };

  const btn = (color) => ({
    padding: "0.6rem 1.2rem",
    background: color,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: "0.9rem",
    marginRight: "0.75rem",
  });

  return (
    <div style={box}>
      <h2 style={{ color: "#818cf8", marginTop: 0 }}>🔧 Lead API Debugger</h2>
      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
        This page shows the EXACT error from the server. Delete after fixing.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <button style={btn("#6366f1")} onClick={testAuth} disabled={loading}>
          1. Test Auth (/api/auth/me)
        </button>
        <button style={btn("#3b82f6")} onClick={testCreate} disabled={loading}>
          2. Test Create Lead
        </button>
      </div>

      {loading && <p style={{ color: "#f59e0b" }}>⏳ Loading...</p>}

      {result && (
        <div>
          <div style={{
            background: result.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${result.ok ? "#22c55e" : "#ef4444"}`,
            borderRadius: "10px",
            padding: "1rem",
          }}>
            <p style={{ margin: "0 0 0.5rem", color: result.ok ? "#22c55e" : "#ef4444", fontWeight: "bold" }}>
              HTTP {result.status} — {result.ok ? "✅ SUCCESS" : "❌ FAILED"}
            </p>
            <pre style={{
              margin: 0,
              color: "#e2e8f0",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {JSON.stringify(result.body, null, 2)}
            </pre>
          </div>

          {!result.ok && result.body?.error && (
            <div style={{
              marginTop: "1rem",
              background: "rgba(251,191,36,0.1)",
              border: "1px solid #f59e0b",
              borderRadius: "10px",
              padding: "1rem",
            }}>
              <p style={{ margin: "0 0 0.5rem", color: "#f59e0b", fontWeight: "bold" }}>
                🔍 Exact Error:
              </p>
              <pre style={{ margin: 0, color: "#fcd34d", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                {result.body.error}
              </pre>
              <div style={{ marginTop: "1rem", color: "#94a3b8", fontSize: "0.82rem" }}>
                <p style={{ margin: "0 0 0.5rem", color: "#64748b" }}>Common causes:</p>
                <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                  <li>Cannot find module → wrong import path in create route</li>
                  <li>ECONNREFUSED → MongoDB not running</li>
                  <li>ValidationError → Mongoose schema mismatch</li>
                  <li>Cannot read properties of undefined → null ref in code</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}