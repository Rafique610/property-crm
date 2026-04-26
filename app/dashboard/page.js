"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
const [leads, setLeads] = useState([]);

useEffect(() => {
fetchLeads();

const interval = setInterval(fetchLeads, 5000); // polling

return () => clearInterval(interval);

}, []);

const fetchLeads = async () => {
const res = await fetch("/api/leads");
const data = await res.json();
setLeads(data.leads || []);
};

return ( <div className="p-6"> <h1 className="text-xl mb-4">Dashboard</h1>

  <div className="grid grid-cols-3 gap-4">
    {leads.map((lead) => (
      <div key={lead._id} className="border p-4">
        <h2>{lead.name}</h2>
        <p>{lead.status}</p>
        <p>{lead.score}</p>
      </div>
    ))}
  </div>
</div>

);
}
