
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const FEATURES = [
  { icon: "🏭", title: "Multi-Site Control", desc: "Manage unlimited warehouse sites from one command-centre dashboard.", accent: "#00d4ff" },
  { icon: "⚡", title: "Sub-100ms Response", desc: "Lightning-fast at 10,000+ concurrent users — no throttling, ever.", accent: "#7c3aed" },
  { icon: "🔒", title: "Enterprise Security", desc: "SOC 2 Type II. Role-based access. SSO. End-to-end encryption at rest.", accent: "#059669" },
  { icon: "🌐", title: "Global Scale", desc: "Multi-currency, multi-language across every timezone.", accent: "#d97706" },
  { icon: "📱", title: "Mobile-First Floor App", desc: "Full-feature scan-and-pick app your floor staff will actually want to use.", accent: "#dc2626" },
  { icon: "🔗", title: "ERP Integration", desc: "Native connectors for SAP, Oracle, NetSuite and 20+ WMS platforms.", accent: "#0891b2" },
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "148px 24px 80px" }}>
        <button onClick={() => navigate("/")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 10, padding: "8px 18px", cursor: "pointer", marginBottom: 48, fontSize: 14 }}>← Back to Home</button>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Platform Features</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.8, marginBottom: 64, maxWidth: 600 }}>Six reasons WSOS outperforms legacy WMS tools — built different, from day one.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${f.accent}30`, borderRadius: 18, padding: "36px 28px", textAlign: "center", transition: "all 0.3s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${f.accent}60`; el.style.transform = "translateY(-4px)"; el.style.boxShadow = `0 12px 40px ${f.accent}15`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${f.accent}30`; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 44, marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ color: f.accent, fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
