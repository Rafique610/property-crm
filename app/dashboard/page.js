// FILE: app/dashboard/page.js
"use client";
import { useEffect, useState, useCallback } from "react";

const styles = {
  root: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "240px", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", zIndex: 100 },
  mainContent: { marginLeft: "240px", padding: "2rem", minHeight: "100vh" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" },
  input: { width: "100%", padding: "0.625rem 0.875rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  label: { display: "block", color: "#64748b", fontSize: "0.75rem", fontWeight: "500", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  btn: (color = "#6366f1", ghost = false) => ({ padding: "0.5rem 1rem", background: ghost ? "transparent" : color, border: ghost ? `1px solid ${color}` : "none", borderRadius: "8px", color: ghost ? color : "white", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }),
};

const SCORE_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const STATUS_COLORS = { New: "#6366f1", Contacted: "#3b82f6", "In Progress": "#f59e0b", Closed: "#22c55e" };

function Badge({ label, color }) {
  return (
    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: "700", background: `${color}22`, color, border: `1px solid ${color}44`, letterSpacing: "0.03em" }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, color = "#6366f1", icon }) {
  return (
    <div style={{ ...styles.card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `${color}11`, borderRadius: "0 16px 0 100%", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "0.75rem" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
      </div>
      <p style={{ margin: "0 0 0.5rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>{label}</p>
      <p style={{ margin: "0 0 0.25rem", fontSize: "2rem", fontWeight: "700", color, fontFamily: "'Syne', sans-serif" }}>{value}</p>
      {sub && <p style={{ margin: 0, color: "#475569", fontSize: "0.75rem" }}>{sub}</p>}
    </div>
  );
}

// ── Donut Chart (SVG, no library needed) ─────────────────────────────────────
function DonutChart({ data, colors, total }) {
  const [hovered, setHovered] = useState(null);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = data.map((item) => {
    const pct = total > 0 ? item.count / total : 0;
    const dashOffset = circumference - pct * circumference;
    const rotation = cumulative * 360 - 90;
    cumulative += pct;
    return { ...item, dashOffset, rotation, pct };
  });

  const hoveredSeg = segments.find((s) => s._id === hovered);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colors[seg._id] || "#64748b"}
              strokeWidth={hovered === seg._id ? strokeWidth + 5 : strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              style={{
                transform: `rotate(${seg.rotation}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
                transition: "stroke-width 0.2s, opacity 0.2s",
                opacity: hovered && hovered !== seg._id ? 0.35 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(seg._id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center label */}
          {hoveredSeg ? (
            <>
              <text x={cx} y={cy - 10} textAnchor="middle" fill={colors[hoveredSeg._id] || "#f1f5f9"} fontSize="22" fontWeight="700" fontFamily="'Syne', sans-serif">{hoveredSeg.count}</text>
              <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="'DM Sans', sans-serif">{hoveredSeg._id || "Unknown"}</text>
              <text x={cx} y={cy + 22} textAnchor="middle" fill={colors[hoveredSeg._id] || "#64748b"} fontSize="11" fontWeight="700" fontFamily="'DM Sans', sans-serif">{Math.round(hoveredSeg.pct * 100)}%</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9" fontSize="26" fontWeight="700" fontFamily="'Syne', sans-serif">{total}</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#475569" fontSize="10" fontFamily="'DM Sans', sans-serif">total leads</text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: "120px" }}>
        {segments.map((seg) => (
          <div
            key={seg._id}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", opacity: hovered && hovered !== seg._id ? 0.4 : 1, transition: "opacity 0.2s" }}
            onMouseEnter={() => setHovered(seg._id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: colors[seg._id] || "#64748b", flexShrink: 0 }} />
            <span style={{ fontSize: "0.8rem", color: "#cbd5e1", flex: 1 }}>{seg._id || "Unknown"}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: colors[seg._id] || "#64748b" }}>{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart (SVG, no library needed) ───────────────────────────────────────
function BarChart({ data, colors, total }) {
  const [hovered, setHovered] = useState(null);
  const chartH = 130;
  const barW = 64;
  const gap = 28;
  const padL = 16;
  const chartW = padL + data.length * (barW + gap);
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 52}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Horizontal guide lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={0} y1={chartH - pct * chartH}
          x2={chartW} y2={chartH - pct * chartH}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1"
        />
      ))}

      {data.map((item, i) => {
        const barH = Math.max((item.count / maxVal) * chartH, 4);
        const x = padL + i * (barW + gap);
        const y = chartH - barH;
        const color = colors[item._id] || "#64748b";
        const isHov = hovered === item._id;

        return (
          <g
            key={item._id || i}
            onMouseEnter={() => setHovered(item._id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Bar track */}
            <rect x={x} y={0} width={barW} height={chartH} rx={8} fill="rgba(255,255,255,0.03)" />
            {/* Bar fill */}
            <rect x={x} y={y} width={barW} height={barH} rx={8} fill={color} opacity={isHov ? 1 : 0.7} filter={isHov ? "url(#barGlow)" : undefined} style={{ transition: "opacity 0.2s" }} />
            {/* Gradient shine */}
            <rect x={x} y={y} width={barW} height={Math.min(barH / 2, 30)} rx={8} fill="rgba(255,255,255,0.1)" />
            {/* Count above bar */}
            <text x={x + barW / 2} y={y - 8} textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="'Syne', sans-serif">{item.count}</text>
            {/* Label below */}
            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="'DM Sans', sans-serif">{item._id || "?"}</text>
            {/* Percentage */}
            <text x={x + barW / 2} y={chartH + 34} textAnchor="middle" fill="#475569" fontSize="10" fontFamily="'DM Sans', sans-serif">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Agent Performance Bars ────────────────────────────────────────────────────
function AgentPerformanceChart({ agentStats }) {
  const maxLeads = Math.max(...agentStats.map((a) => a.totalLeads), 1);
  const palette = ["#6366f1", "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e", "#ec4899"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {agentStats.map((agent, i) => {
        const pct = (agent.totalLeads / maxLeads) * 100;
        const color = palette[i % palette.length];
        return (
          <div key={agent._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "700", color, flexShrink: 0 }}>
                  {(agent.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "600" }}>{agent.name || "Unknown Agent"}</div>
                  <div style={{ fontSize: "0.7rem", color: "#475569" }}>{agent.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "700", color, fontFamily: "'Syne', sans-serif" }}>{agent.totalLeads}</span>
                <span style={{ fontSize: "0.7rem", color: "#475569" }}>leads</span>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: "7px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: "999px", transition: "width 0.7s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [agents, setAgents] = useState([]);
  const [activityLog, setActivityLog] = useState({});
  const [activeTab, setActiveTab] = useState("leads");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [notesInput, setNotesInput] = useState({});
  const [followUpInput, setFollowUpInput] = useState({});
  const [assignInput, setAssignInput] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedLead, setExpandedLead] = useState(null);
  const [savingNotes, setSavingNotes] = useState({});
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", propertyInterest: "", budget: "", notes: "" });

  useEffect(() => {
    fetchUser();
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { applyFilters(); }, [leads, statusFilter, priorityFilter, searchFilter]);

  const fetchUser = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    if (!res.ok) { window.location.href = "/login"; return; }
    setUser(data.user);
    fetchInsights(); // all roles need insights
    if (data.user.role === "admin") { fetchAnalytics(); fetchAgents(); }
  };

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads", { credentials: "include" });
    const data = await res.json();
    setLeads(data.leads || []);
  }, []);

  const fetchAnalytics = async () => {
    const res = await fetch("/api/leads/analytics", { credentials: "include" });
    setAnalytics(await res.json());
  };

  const fetchInsights = async () => {
    const res = await fetch("/api/leads/insights", { credentials: "include" });
    setInsights(await res.json());
  };

  const fetchAgents = async () => {
    const res = await fetch("/api/users/agents", { credentials: "include" });
    const data = await res.json();
    setAgents(data.agents || []);
  };

  const fetchActivityLog = async (leadId) => {
    const res = await fetch(`/api/leads/${leadId}/activity`, { credentials: "include" });
    const data = await res.json();
    setActivityLog((prev) => ({ ...prev, [leadId]: data.logs || [] }));
  };

  const applyFilters = () => {
    let result = [...leads];
    if (statusFilter) result = result.filter((l) => l.status === statusFilter);
    if (priorityFilter) result = result.filter((l) => l.score === priorityFilter);
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      result = result.filter((l) => l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.propertyInterest?.toLowerCase().includes(q));
    }
    setFilteredLeads(result);
  };

  const createLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.propertyInterest || !newLead.budget) { alert("Name, Email, Property & Budget are required"); return; }
    const res = await fetch("/api/leads/create", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...newLead, budget: Number(newLead.budget) }) });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    setNewLead({ name: "", email: "", phone: "", propertyInterest: "", budget: "", notes: "" });
    setShowCreateForm(false);
    fetchLeads();
  };

  const updateLead = async (leadId, updates) => {
    const res = await fetch("/api/leads/update", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ leadId, ...updates }) });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    fetchLeads();
    if (expandedLead === leadId) fetchActivityLog(leadId);
  };

  const saveNotes = async (leadId) => {
    if (!notesInput[leadId]) return;
    setSavingNotes((p) => ({ ...p, [leadId]: true }));
    await updateLead(leadId, { notes: notesInput[leadId] });
    setSavingNotes((p) => ({ ...p, [leadId]: false }));
  };

  const setFollowUp = async (leadId) => {
    const date = followUpInput[leadId];
    if (!date) return;
    const res = await fetch("/api/leads/followup", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ leadId, followUpDate: date }) });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    fetchLeads();
  };

  const deleteLead = async (leadId) => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    const res = await fetch("/api/leads/delete", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ leadId }) });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    fetchLeads();
  };

  const toggleExpand = (leadId) => {
    if (expandedLead === leadId) setExpandedLead(null);
    else { setExpandedLead(leadId); fetchActivityLog(leadId); }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  const formatCurrency = (n) =>
    n >= 10_000_000 ? `${(n / 10_000_000).toFixed(1)}Cr` : n >= 100_000 ? `${(n / 100_000).toFixed(1)}L` : n?.toLocaleString() ?? "—";

  const isOverdue = (lead) => lead.followUpDate && new Date(lead.followUpDate) < new Date();

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6366f1", fontSize: "1.5rem" }}>Loading...</div>
    </div>
  );

  const overdueCount = insights?.overdueLeads?.length ?? 0;
  const inactiveCount = insights?.inactiveLeads?.length ?? 0;
  const highPriorityCount = leads.filter((l) => l.score === "High").length;

  const navItems = [
    { id: "leads", label: "Leads", icon: "👥" },
    ...(user.role === "admin" ? [{ id: "analytics", label: "Analytics", icon: "📊" }] : []),
    { id: "insights", label: "Insights", icon: "🔔" },
  ];

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <aside style={styles.sidebar}>
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏠</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "0.95rem", color: "#f1f5f9" }}>PropertyCRM</div>
              <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{user.role}</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "none", background: activeTab === item.id ? "rgba(99,102,241,0.15)" : "transparent", color: activeTab === item.id ? "#818cf8" : "#64748b", fontSize: "0.875rem", fontWeight: activeTab === item.id ? "600" : "400", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.25rem", textAlign: "left", transition: "all 0.15s" }}>
              <span>{item.icon}</span>
              {item.label}
              {item.id === "leads" && overdueCount > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", borderRadius: "999px", padding: "0.1rem 0.4rem", fontSize: "0.65rem", fontWeight: "700" }}>{overdueCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "700", color: "white" }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1" }}>{user.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#475569" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ ...styles.btn("#ef4444", true), width: "100%", textAlign: "center" }}>Sign Out</button>
        </div>
      </aside>

      <main style={styles.mainContent}>

        {/* ══ LEADS TAB ══ */}
        {activeTab === "leads" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.75rem", fontWeight: "800", margin: 0, color: "#f1f5f9" }}>{user.role === "admin" ? "All Leads" : "My Leads"}</h1>
                <p style={{ color: "#475569", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} found
                  {overdueCount > 0 && <span style={{ color: "#ef4444", marginLeft: "0.5rem" }}>· {overdueCount} overdue</span>}
                </p>
              </div>
              <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ ...styles.btn(), boxShadow: "0 4px 15px rgba(99,102,241,0.3)" }}>+ New Lead</button>
            </div>

            {showCreateForm && (
              <div style={{ ...styles.card, marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.3)" }}>
                <h3 style={{ margin: "0 0 1.25rem", color: "#c7d2fe", fontSize: "1rem", fontWeight: "600" }}>Create New Lead</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                  {[
                    { key: "name", label: "Full Name *", placeholder: "Ahmed Khan" },
                    { key: "email", label: "Email *", placeholder: "ahmed@example.com", type: "email" },
                    { key: "phone", label: "Phone (WhatsApp)", placeholder: "923001234567" },
                    { key: "propertyInterest", label: "Property Interest *", placeholder: "3BHK DHA Phase 6" },
                    { key: "budget", label: "Budget (PKR) *", placeholder: "15000000", type: "number" },
                  ].map(({ key, label, placeholder, type = "text" }) => (
                    <div key={key}>
                      <label style={styles.label}>{label}</label>
                      <input type={type} placeholder={placeholder} value={newLead[key]} onChange={(e) => setNewLead({ ...newLead, [key]: e.target.value })} style={styles.input} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={styles.label}>Notes</label>
                  <textarea placeholder="Additional notes..." value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} rows={2} style={{ ...styles.input, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button onClick={createLead} style={styles.btn()}>Create Lead</button>
                  <button onClick={() => setShowCreateForm(false)} style={styles.btn("#64748b", true)}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ ...styles.card, marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1", minWidth: "180px" }}>
                <label style={styles.label}>Search</label>
                <input placeholder="Name, email, property..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...styles.input, width: "auto" }}>
                  <option value="">All Status</option>
                  <option>New</option><option>Contacted</option><option>In Progress</option><option>Closed</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Priority</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ ...styles.input, width: "auto" }}>
                  <option value="">All Priority</option>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              {(statusFilter || priorityFilter || searchFilter) && (
                <button onClick={() => { setStatusFilter(""); setPriorityFilter(""); setSearchFilter(""); }} style={styles.btn("#64748b", true)}>Clear Filters</button>
              )}
            </div>

            <div style={styles.card}>
              {filteredLeads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                  <p style={{ margin: 0 }}>No leads found</p>
                </div>
              ) : filteredLeads.map((lead) => {
                const overdue = isOverdue(lead);
                const isExpanded = expandedLead === lead._id;
                const logs = activityLog[lead._id] || [];
                return (
                  <div key={lead._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: overdue ? "rgba(239,68,68,0.04)" : "transparent" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto auto", alignItems: "center", gap: "1rem", padding: "1rem", cursor: "pointer" }} onClick={() => toggleExpand(lead._id)}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          {overdue && <span>🔴</span>}
                          <span style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.9rem" }}>{lead.name}</span>
                        </div>
                        <div style={{ color: "#475569", fontSize: "0.75rem" }}>
                          {lead.email}
                          {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ marginLeft: "0.5rem", color: "#22c55e", textDecoration: "none" }}>💬 WA</a>}
                        </div>
                        <div style={{ color: "#334155", fontSize: "0.7rem", marginTop: "0.2rem" }}>{lead.propertyInterest}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", color: "#c7d2fe", fontSize: "0.9rem" }}>{formatCurrency(lead.budget)}</div>
                        <div style={{ color: "#334155", fontSize: "0.65rem" }}>PKR</div>
                      </div>
                      <Badge label={lead.score || "Low"} color={SCORE_COLORS[lead.score] || "#22c55e"} />
                      <Badge label={lead.status} color={STATUS_COLORS[lead.status] || "#6366f1"} />
                      <div style={{ color: "#475569", fontSize: "0.75rem", textAlign: "right" }}>{lead.assignedTo?.name || <span style={{ color: "#334155" }}>Unassigned</span>}</div>
                      <div style={{ color: "#334155", fontSize: "0.75rem", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 1rem 1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                          <div>
                            <label style={styles.label}>Update Status</label>
                            <select defaultValue="" onChange={(e) => { if (!e.target.value) return; updateLead(lead._id, { status: e.target.value }); e.target.value = ""; }} style={{ ...styles.input, width: "auto" }}>
                              <option value="">— Change status —</option>
                              <option>New</option><option>Contacted</option><option>In Progress</option><option>Closed</option>
                            </select>
                          </div>
                          <div>
                            <label style={styles.label}>Notes</label>
                            <textarea placeholder={lead.notes || "Add a note..."} value={notesInput[lead._id] ?? ""} onChange={(e) => setNotesInput({ ...notesInput, [lead._id]: e.target.value })} rows={2} style={{ ...styles.input, resize: "vertical", marginBottom: "0.5rem" }} />
                            <button onClick={() => saveNotes(lead._id)} disabled={savingNotes[lead._id]} style={styles.btn("#3b82f6")}>{savingNotes[lead._id] ? "Saving..." : "Save Notes"}</button>
                          </div>
                          <div>
                            <label style={styles.label}>Set Follow-up Date</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <input type="date" value={followUpInput[lead._id] ?? ""} onChange={(e) => setFollowUpInput({ ...followUpInput, [lead._id]: e.target.value })} style={{ ...styles.input, width: "auto" }} />
                              <button onClick={() => setFollowUp(lead._id)} style={styles.btn("#f59e0b")}>Set</button>
                            </div>
                            {lead.followUpDate && (
                              <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: overdue ? "#ef4444" : "#64748b" }}>
                                {overdue ? "⚠️ Overdue: " : "📅 Due: "}{new Date(lead.followUpDate).toLocaleDateString("en-PK")}
                              </p>
                            )}
                          </div>
                          {user.role === "admin" && (
                            <div>
                              <label style={styles.label}>Assign to Agent</label>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <select value={assignInput[lead._id] ?? ""} onChange={(e) => setAssignInput({ ...assignInput, [lead._id]: e.target.value })} style={{ ...styles.input, width: "auto" }}>
                                  <option value="">— Select agent —</option>
                                  {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                                <button onClick={() => { if (!assignInput[lead._id]) return; updateLead(lead._id, { assignedTo: assignInput[lead._id] }); }} style={styles.btn("#6366f1")}>Assign</button>
                              </div>
                            </div>
                          )}
                          <div style={{ marginTop: "0.5rem" }}>
                            <button onClick={() => deleteLead(lead._id)} style={styles.btn("#ef4444", true)}>🗑 Delete Lead</button>
                          </div>
                        </div>
                        <div>
                          <label style={styles.label}>Activity Timeline</label>
                          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                            {logs.length === 0 ? <p style={{ color: "#334155", fontSize: "0.8rem" }}>No activity yet</p> : logs.map((log, i) => (
                              <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-start" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", marginTop: "0.35rem", flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: "0.78rem", color: "#c7d2fe", fontWeight: "500" }}>{log.action}</div>
                                  <div style={{ fontSize: "0.72rem", color: "#475569" }}>{log.details}</div>
                                  <div style={{ fontSize: "0.68rem", color: "#334155", marginTop: "0.15rem" }}>{new Date(log.createdAt).toLocaleString("en-PK")}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ANALYTICS TAB ══ */}
        {activeTab === "analytics" && user.role === "admin" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.75rem", fontWeight: "800", margin: 0, color: "#f1f5f9" }}>Analytics</h1>
              <p style={{ color: "#475569", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>System-wide overview — hover charts to explore</p>
            </div>

            {analytics ? (
              <>
                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                  <StatCard label="Total Leads" value={analytics.totalLeads} icon="👥" color="#6366f1" />
                  <StatCard label="High Priority" value={highPriorityCount} icon="🔥" color="#ef4444" sub="Budget > 20Cr" />
                  <StatCard label="Overdue" value={overdueCount} icon="⏰" color="#f59e0b" />
                  <StatCard label="Inactive" value={inactiveCount} icon="💤" color="#64748b" sub="No activity 7d" />
                </div>

                {/* ── Charts Row ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

                  {/* Donut — Status */}
                  <div style={styles.card}>
                    <p style={{ margin: "0 0 1.25rem", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                      Lead Status Distribution
                    </p>
                    {analytics.statusStats?.length > 0
                      ? <DonutChart data={analytics.statusStats} colors={STATUS_COLORS} total={analytics.totalLeads} />
                      : <p style={{ color: "#334155", fontSize: "0.85rem" }}>No data yet</p>
                    }
                  </div>

                  {/* Bar — Priority */}
                  <div style={styles.card}>
                    <p style={{ margin: "0 0 1.25rem", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                      Priority Breakdown
                    </p>
                    {analytics.priorityStats?.length > 0
                      ? <BarChart data={analytics.priorityStats} colors={SCORE_COLORS} total={analytics.totalLeads} />
                      : <p style={{ color: "#334155", fontSize: "0.85rem" }}>No data yet</p>
                    }
                  </div>
                </div>

                {/* Agent Performance */}
                <div style={styles.card}>
                  <p style={{ margin: "0 0 1.25rem", color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    Agent Performance Overview
                  </p>
                  {!analytics.agentStats?.length
                    ? <p style={{ color: "#334155", fontSize: "0.85rem" }}>No agent assignments yet</p>
                    : <AgentPerformanceChart agentStats={analytics.agentStats} />
                  }
                </div>
              </>
            ) : (
              <div style={{ color: "#475569" }}>Loading analytics...</div>
            )}
          </div>
        )}

        {/* ══ INSIGHTS TAB ══ */}
        {activeTab === "insights" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.75rem", fontWeight: "800", margin: 0, color: "#f1f5f9" }}>Insights</h1>
              <p style={{ color: "#475569", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>Follow-up alerts and inactive leads</p>
            </div>
            {insights ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={styles.card}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ef4444" }}>⏰ Overdue Follow-ups ({insights.overdueLeads.length})</h3>
                  {insights.overdueLeads.length === 0 ? <p style={{ color: "#334155", fontSize: "0.85rem" }}>All caught up ✅</p> : insights.overdueLeads.map((l) => (
                    <div key={l._id} style={{ padding: "0.75rem", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: "600", color: "#fca5a5", fontSize: "0.85rem" }}>{l.name}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Due: {new Date(l.followUpDate).toLocaleDateString("en-PK")}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.card}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>💤 Inactive Leads ({insights.inactiveLeads.length})</h3>
                  {insights.inactiveLeads.length === 0 ? <p style={{ color: "#334155", fontSize: "0.85rem" }}>All leads are active ✅</p> : insights.inactiveLeads.map((l) => (
                    <div key={l._id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: "600", color: "#94a3b8", fontSize: "0.85rem" }}>{l.name}</div>
                      <div style={{ color: "#475569", fontSize: "0.72rem" }}>Last activity: {new Date(l.lastActivity).toLocaleDateString("en-PK")}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: "#475569" }}>Loading insights...</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}