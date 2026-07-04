import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "148px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#00d4ff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>About Us</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.85, marginBottom: 24 }}>Built by logistics engineers and data scientists who lived the problem — warehouses bursting at the seams while shelves sat half-empty two aisles over.</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.85, marginBottom: 48 }}>Our platform fuses IoT sensor data, AI demand forecasting, and human-centred design to give your team tools they actually want to use.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { label: "Mission", text: "Eliminate wasted space and motion from every warehouse on earth.", icon: "🎯", color: "#00d4ff" },
            { label: "Vision", text: "A world where inventory is always in the right place at the right time.", icon: "🔭", color: "#7c3aed" },
            { label: "Values", text: "Transparency, precision, and relentless iteration with our clients.", icon: "💎", color: "#059669" },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}30`, borderRadius: 18, padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ color: item.color, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>{item.label}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
