"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
const [user, setUser] = useState(null);
const [leads, setLeads] = useState([]);
const [analytics, setAnalytics] = useState(null);
const [insights, setInsights] = useState(null);

useEffect(() => {
fetchUser();
fetchLeads();

const interval = setInterval(() => {
  fetchLeads();
}, 5000);

return () => clearInterval(interval);

}, []);

const fetchUser = async () => {
const res = await fetch("/api/auth/me");
const data = await res.json();
setUser(data.user);

// If admin → fetch analytics + insights
if (data.user.role === "admin") {
  fetchAnalytics();
  fetchInsights();
}

};

const fetchLeads = async () => {
const res = await fetch("/api/leads");
const data = await res.json();
setLeads(data.leads || []);
};

const fetchAnalytics = async () => {
const res = await fetch("/api/leads/analytics");
const data = await res.json();
setAnalytics(data);
};

const fetchInsights = async () => {
const res = await fetch("/api/leads/insights");
const data = await res.json();
setInsights(data);
};

if (!user) return <div className="p-6">Loading...</div>;

return ( <div className="p-6"> <h1 className="text-2xl mb-4">
{user.role === "admin" ? "Admin Dashboard" : "Agent Dashboard"} </h1>

  {/* 🔴 ADMIN VIEW */}
  {user.role === "admin" && analytics && insights && (
    <div>
      <h2 className="text-xl mb-2">Analytics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border p-4">
          Total Leads: {analytics.totalLeads}
        </div>

        <div className="border p-4">
          Status:
          {analytics.statusStats.map((s) => (
            <div key={s._id}>
              {s._id}: {s.count}
            </div>
          ))}
        </div>

        <div className="border p-4">
          Priority:
          {analytics.priorityStats.map((p) => (
            <div key={p._id}>
              {p._id}: {p.count}
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl mb-2">Insights</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border p-4">
          Overdue Leads: {insights.overdueLeads.length}
        </div>

        <div className="border p-4">
          Inactive Leads: {insights.inactiveLeads.length}
        </div>
      </div>
    </div>
  )}

  {/* 🔵 LEADS (COMMON) */}
  <h2 className="text-xl mb-2">Leads</h2>

  <div className="grid grid-cols-3 gap-4">
    {leads.map((lead) => (
      <div key={lead._id} className="border p-4">
        <h3 className="font-bold">{lead.name}</h3>
        <p>Status: {lead.status}</p>
        <p>Priority: {lead.score}</p>

        {lead.followUpDate && (
          <p>Follow-up: {new Date(lead.followUpDate).toDateString()}</p>
        )}
      </div>
    ))}
  </div>
</div>
);
}
