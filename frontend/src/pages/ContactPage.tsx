import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

export default function ContactPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        .gi { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); color:#fff; border-radius:11px; padding:14px 16px; font-size:14px; width:100%; font-family:inherit; transition:all 0.3s; outline:none; }
        .gi:focus { border-color:#00d4ff; box-shadow:0 0 0 3px rgba(0,212,255,0.1); }
        .gi::placeholder { color:rgba(255,255,255,0.22); }
      `}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "148px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get In Touch</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.8, marginBottom: 48 }}>Whether you manage 1 warehouse or 500, we'll tailor a live demo to your exact operation.</p>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.14)", borderRadius: 24, padding: "48px 44px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 60, marginBottom: 18 }}>✅</div>
              <h3 style={{ color: "#00d4ff", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>You're on the list.</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>Our team will reach out within 24 hours.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Full Name</label>
                  <input className="gi" placeholder="Jane Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Work Email</label>
                  <input className="gi" type="email" placeholder="jane@acme.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              </div>
              <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Company</label>
                <input className="gi" placeholder="Acme Logistics" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
              <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Tell Us Your Challenge</label>
                <textarea className="gi" rows={5} placeholder="Describe your warehouse setup..." style={{ resize: "none" }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} /></div>
              <button onClick={() => setSent(true)} style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 11, color: "#000", fontWeight: 800, padding: "16px", cursor: "pointer", fontSize: 15 }}>Send Message ✈</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
