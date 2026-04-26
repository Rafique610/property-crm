"use client";
// FILE: app/signup/page.js
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async () => {
    const { name, email, password, confirmPassword } = form;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: "block",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: "1rem",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "24px",
          padding: "2.5rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: "800", color: "#22c55e", margin: "0 0 0.75rem" }}>
            Account Created!
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 2rem" }}>
            Your account has been created as an <strong style={{ color: "#f1f5f9" }}>Agent</strong>. Ask your admin to assign you leads.
          </p>
          <a href="/login" style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            borderRadius: "10px",
            color: "white",
            fontSize: "0.95rem",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          }}>
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "1rem",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            borderRadius: "16px",
            marginBottom: "1rem",
            boxShadow: "0 0 30px rgba(99,102,241,0.4)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "#f8fafc",
            margin: "0 0 0.25rem 0",
            letterSpacing: "-0.02em",
          }}>PropertyCRM</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
            Create your agent account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "2.5rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}>
          <h2 style={{ color: "#f1f5f9", fontSize: "1.25rem", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
            Create Account
          </h2>
          <p style={{ color: "#475569", fontSize: "0.875rem", margin: "0 0 2rem 0" }}>
            You'll be registered as an <span style={{ color: "#818cf8" }}>Agent</span> by default
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              color: "#fca5a5",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                placeholder="Ahmed Khan"
                value={form.name}
                onChange={handleChange("name")}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="agent@propertycrm.com"
                value={form.email}
                onChange={handleChange("email")}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange("password")}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Role notice */}
            <div style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}>
              <span style={{ fontSize: "1rem" }}>ℹ️</span>
              <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                New accounts are created as <strong style={{ color: "#818cf8" }}>Agent</strong>. Admins are created directly in the database.
              </span>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                marginTop: "0.25rem",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#334155", fontSize: "0.8rem", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: "500" }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}