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

const interval = setInterval(fetchLeads, 5000);
return () => clearInterval(interval);

}, []);

const fetchUser = async () => {
const res = await fetch("/api/auth/me", {
credentials: "include",
});
const data = await res.json();
setUser(data.user);

if (data.user.role === "admin") {
  fetchAnalytics();
  fetchInsights();
}

};

const fetchLeads = async () => {
const res = await fetch("/api/leads", {
credentials: "include",
});
const data = await res.json();
setLeads(data.leads || []);
};

const fetchAnalytics = async () => {
const res = await fetch("/api/leads/analytics", {
credentials: "include",
});
const data = await res.json();
setAnalytics(data);
};

const fetchInsights = async () => {
const res = await fetch("/api/leads/insights", {
credentials: "include",
});
const data = await res.json();
setInsights(data);
};

const updateLead = async (leadId, updates) => {
await fetch("/api/leads/update", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
credentials: "include",
body: JSON.stringify({ leadId, ...updates }),
});

fetchLeads();

};

const setFollowUp = async (leadId, date) => {
await fetch("/api/leads/followup", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
credentials: "include",
body: JSON.stringify({
leadId,
followUpDate: date,
}),
});

fetchLeads();

};

if (!user) return <div className="p-6">Loading...</div>;

return ( <div className="p-6"> <h1 className="text-2xl mb-4">
{user.role === "admin" ? "Admin Dashboard" : "Agent Dashboard"} </h1>

```
  {/* 🔴 ADMIN VIEW */}
  {user.role === "admin" && analytics && insights && (
    <div>
      <h2 className="text-xl mb-2">Analytics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border p-4">
          <strong>Total Leads:</strong> {analytics.totalLeads}
        </div>

        <div className="border p-4">
          <strong>Status:</strong>
          {analytics.statusStats.map((s) => (
            <div key={s._id}>
              {s._id}: {s.count}
            </div>
          ))}
        </div>

        <div className="border p-4">
          <strong>Priority:</strong>
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

  {/* 🔵 LEADS */}
  <h2 className="text-xl mb-2">Leads</h2>

  <div className="grid grid-cols-3 gap-4">
    {leads.map((lead) => (
      <div key={lead._id} className="border p-4">
        <h3 className="font-bold">{lead.name}</h3>
        <p>Status: {lead.status}</p>
        <p>Priority: {lead.score}</p>

        {lead.followUpDate && (
          <p>
            Follow-up:{" "}
            {new Date(lead.followUpDate).toDateString()}
          </p>
        )}

        {/* 🔹 Update Status */}
        <select
          onChange={(e) =>
            updateLead(lead._id, { status: e.target.value })
          }
          className="border mt-2"
        >
          <option value="">Update Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </select>

        {/* 🔹 Notes */}
        <button
          onClick={() => {
            const notes = prompt("Enter notes");
            if (notes) updateLead(lead._id, { notes });
          }}
          className="bg-gray-200 px-2 py-1 mt-2 block"
        >
          Add Notes
        </button>

        {/* 🔹 Follow-up */}
        <button
          onClick={() => {
            const date = prompt("Enter follow-up date (YYYY-MM-DD)");
            if (date) setFollowUp(lead._id, date);
          }}
          className="bg-yellow-200 px-2 py-1 mt-2 block"
        >
          Set Follow-up
        </button>

        {/* 🔴 Admin Only */}
        {user.role === "admin" && (
          <button
            onClick={() => {
              const agentId = prompt("Enter Agent ID");
              if (agentId)
                updateLead(lead._id, { assignedTo: agentId });
            }}
            className="bg-blue-200 px-2 py-1 mt-2 block"
          >
            Assign Lead
          </button>
        )}
      </div>
    ))}
  </div>
</div>

);
}
