import { useNavigate } from "react-router-dom";

const SERVICES = [
  { icon: "📦", title: "3D Space Analysis", desc: "AI-powered volumetric mapping reconstructs your warehouse in real time — dead zones get flagged before they cost you.", color: "#00d4ff" },
  { icon: "🗺️", title: "Layout Planning", desc: "Dynamic floor-plan engine adapts to your SKU velocity, pick paths, and seasonal spikes in under 60 seconds.", color: "#7c3aed" },
  { icon: "📡", title: "Real-Time Tracking", desc: "Live inventory pulse across every rack and zone with millisecond alerts on anomalies.", color: "#059669" },
  { icon: "🤖", title: "AI Forecasting", desc: "Demand signals from 40+ market data feeds fused with your movement history.", color: "#d97706" },
  { icon: "💰", title: "Cost Reduction", desc: "Intelligent slot assignment cuts carrying costs and labour hours by up to 40%.", color: "#dc2626" },
  { icon: "📊", title: "Smart Reports", desc: "Automated reports with drill-down analytics delivered daily.", color: "#0891b2" },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 10, padding: "8px 18px", cursor: "pointer", marginBottom: 48, fontSize: 14 }}>← Back to Home</button>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Our Services</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.8, marginBottom: 64, maxWidth: 600 }}>Every module is engineered to reduce waste, accelerate throughput, and give you full visibility.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {SERVICES.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}30`, borderRadius: 18, padding: "32px 28px", transition: "all 0.3s", cursor: "default" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${s.color}70`; el.style.background = `${s.color}08`; el.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${s.color}30`; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ color: s.color, fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}