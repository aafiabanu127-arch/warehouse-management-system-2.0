import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JOBS = [
  {
    title: "Warehouse Supervisor",
    dept: "Operations",
    type: "Full-Time",
    badge: "🏭",
    location: "Chennai, IN",
    salary: "₹4–6 LPA",
    reqs: ["5+ yrs warehouse ops", "Team leadership (10+ staff)", "Inventory management", "Safety compliance (OSHA)"],
  },
  {
    title: "Forklift Operator",
    dept: "Logistics",
    type: "Full-Time",
    badge: "🚜",
    location: "Mumbai, IN",
    salary: "₹2.5–3.5 LPA",
    reqs: ["Valid forklift licence", "2+ yrs experience", "Load balancing skills", "Safety-first mindset"],
  },
  {
    title: "Inventory Control Specialist",
    dept: "Inventory",
    type: "Full-Time",
    badge: "📦",
    location: "Bangalore, IN",
    salary: "₹3–5 LPA",
    reqs: ["WMS software knowledge", "Stock auditing experience", "Barcode & RFID systems", "Attention to detail"],
  },
  {
    title: "Receiving & Shipping Clerk",
    dept: "Logistics",
    type: "Full-Time",
    badge: "🚚",
    location: "Delhi, IN",
    salary: "₹2–3 LPA",
    reqs: ["Goods receipt & dispatch", "Documentation & labelling", "Vendor coordination", "Basic computer skills"],
  },
  {
    title: "Cold Storage Handler",
    dept: "Cold Chain",
    type: "Full-Time",
    badge: "❄️",
    location: "Pune, IN",
    salary: "₹2.5–4 LPA",
    reqs: ["Cold chain experience", "Temperature monitoring", "PPE compliance", "Physical fitness required"],
  },
  {
    title: "Warehouse Team Leader",
    dept: "Operations",
    type: "Full-Time",
    badge: "👷",
    location: "Hyderabad, IN",
    salary: "₹3.5–5 LPA",
    reqs: ["3+ yrs floor experience", "Shift management", "Pick & pack operations", "KPI tracking"],
  },
  {
    title: "Quality Control Inspector",
    dept: "Quality",
    type: "Contract",
    badge: "🔍",
    location: "Coimbatore, IN",
    salary: "₹3–4.5 LPA",
    reqs: ["Goods inspection skills", "Defect reporting", "Quality documentation", "Attention to standards"],
  },
  {
    title: "Dispatch Coordinator",
    dept: "Dispatch",
    type: "Full-Time",
    badge: "📋",
    location: "Chennai, IN",
    salary: "₹2.5–4 LPA",
    reqs: ["Route planning basics", "Carrier coordination", "Delivery tracking tools", "Communication skills"],
  },
];

export default function CareersPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const depts = ["All", ...Array.from(new Set(JOBS.map(j => j.dept)))];
  const filtered = filter === "All" ? JOBS : JOBS.filter(j => j.dept === filter);

  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>

        {/* Back button */}
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 10, padding: "8px 18px", cursor: "pointer", marginBottom: 48, fontSize: 14 }}>← Back to Home</button>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", borderRadius: 999, padding: "6px 20px", marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} />
            We're Hiring
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 12, letterSpacing: -1.5, background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Warehouse Jobs
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.8, marginBottom: 48, maxWidth: 600 }}>
          Join our warehouse operations team. Hands-on roles across storage, logistics, quality, and dispatch — across India.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap" }}>
          {[{ num: "8", label: "Open Roles" }, { num: "6", label: "Cities" }, { num: "Full-Time", label: "Mostly" }, { num: "Day 1", label: "Benefits" }].map((s, i) => (
            <div key={i}>
              <div style={{ color: "#00d4ff", fontWeight: 900, fontSize: 22 }}>{s.num}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {depts.map(d => (
            <button key={d} onClick={() => { setFilter(d); setExpanded(null); }} style={{
              background: filter === d ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === d ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: filter === d ? "#00d4ff" : "rgba(255,255,255,0.5)",
              borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            }}>{d}</button>
          ))}
        </div>

        {/* Job cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((job, i) => (
            <div key={i}
              style={{
                background: expanded === i ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${expanded === i ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 16, padding: "24px 28px", cursor: "pointer", transition: "all 0.3s",
              }}
              onClick={() => setExpanded(expanded === i ? null : i)}>

              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{job.badge}</div>
                  <div>
                    <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{job.title}</h3>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ color: "#00d4ff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{job.dept}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>·</span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>📍 {job.location}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>·</span>
                      <span style={{ color: "#059669", fontSize: 12, fontWeight: 600 }}>💰 {job.salary}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>·</span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{job.type}</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "#00d4ff", fontSize: 22, transition: "transform 0.3s", display: "inline-block", transform: expanded === i ? "rotate(45deg)" : "rotate(0deg)", flexShrink: 0 }}>+</span>
              </div>

              {/* Expanded requirements */}
              {expanded === i && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                  <h4 style={{ color: "#00d4ff", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Requirements</h4>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                    {job.reqs.map((r, ri) => (
                      <li key={ri} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, paddingLeft: 20, position: "relative", lineHeight: 1.5 }}>
                        <span style={{ position: "absolute", left: 0, color: "#00d4ff", fontWeight: 700 }}>✓</span>{r}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={e => e.stopPropagation()}
                    style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 10, color: "#000", fontWeight: 800, padding: "12px 28px", cursor: "pointer", fontSize: 14 }}>
                    Apply Now →
                    <button
  onClick={e => {
    e.stopPropagation();
    navigate(`/apply?job=${encodeURIComponent(job.title)}&dept=${encodeURIComponent(job.dept)}&location=${encodeURIComponent(job.location)}`);
  }}
  style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 10, color: "#000", fontWeight: 800, padding: "12px 28px", cursor: "pointer", fontSize: 14 }}>
  Apply Now →
</button>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 64, textAlign: "center", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 20, padding: "40px 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📩</div>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Don't see your role?</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 24 }}>Send us your resume and we'll reach out when something fits.</p>
          <button onClick={() => navigate("/contact")} style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 10, color: "#000", fontWeight: 800, padding: "13px 32px", cursor: "pointer", fontSize: 14 }}>
            Send Resume →
          </button>
        </div>

      </div>
    </div>
  );
}