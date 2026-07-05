
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const STEPS = [
  { num: "01", title: "Discovery Call", desc: "30-minute deep dive into your warehouse layout, throughput, and pain points.", icon: "🔍" },
  { num: "02", title: "AI Scan & Map", desc: "Our sensors + your existing data create a complete digital twin of your facility.", icon: "📡" },
  { num: "03", title: "Insight Report", desc: "Receive a detailed breakdown of waste zones, pick inefficiencies, and ROI projection.", icon: "📊" },
  { num: "04", title: "Go Live", desc: "Deployment in under a week. Your team gets trained. Results start on day one.", icon: "🚀" },
];

export default function ProcessPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "148px 24px 80px" }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 10, padding: "8px 18px", cursor: "pointer", marginBottom: 48, fontSize: 14 }}>← Back to Home</button>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>How It Works</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.8, marginBottom: 64, maxWidth: 600 }}>From signed contract to live dashboard in 7 days. No month-long implementations. No army of consultants.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 18, padding: "32px 28px", display: "flex", gap: 24, alignItems: "flex-start", transition: "all 0.3s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(0,212,255,0.35)"; el.style.background = "rgba(0,212,255,0.05)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(0,212,255,0.12)"; el.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#00d4ff", fontWeight: 800, fontSize: 13 }}>{s.num}</span>
              </div>
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
