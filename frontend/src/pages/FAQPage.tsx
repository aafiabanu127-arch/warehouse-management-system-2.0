import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const FAQS = [
  { q: "What is the Warehouse Management System?", a: "It's a single platform to track inventory, plan warehouse layouts, monitor stock movements in real time, and forecast demand — replacing spreadsheets and disconnected tools with one dashboard." },
  { q: "Who can create an account?", a: "Anyone on your operations team can register. Once signed up, an admin assigns each person a role — Admin, Manager, Supervisor, Staff, Picker, Auditor, or Viewer — which controls what they can see and do." },
  { q: "Is my warehouse data secure?", a: "Yes. Accounts are protected with authenticated sessions, role-based access control, and encrypted connections. Only people with the right permissions can view or edit sensitive inventory and financial data." },
  { q: "Can I manage more than one warehouse?", a: "Yes — the system supports multiple warehouses, each with its own zones, racks, and shelves, all visible from a single account so you can compare performance across sites." },
  { q: "Does it integrate with other systems?", a: "The platform exposes a REST API, so it can connect to existing ERP, accounting, or e-commerce systems for orders, stock levels, and reporting." },
  { q: "What happens if I forget my password?", a: "Use the \"Forgot password?\" link on the sign-in page. You'll receive a reset link by email to set a new password securely." },
  { q: "How do I apply for an open role?", a: "Visit the Careers page to see current openings, then use the Apply page to submit your application. Our team reviews applications and reaches out to schedule interviews." },
  { q: "Where can I read the legal terms?", a: "Our Terms & Conditions and Privacy Policy are linked in the footer of every page, and are also shown when you sign up for an account." },
];

function FAQItem({ item, index }: { item: typeof FAQS[number]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: open ? "rgba(63,208,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${open ? "rgba(63,208,255,0.35)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.35s ease",
        opacity: 0,
        animation: `faq-in 0.6s ease ${index * 70}ms forwards`,
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15.5 }}>{item.q}</span>
        <span style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
          border: "1px solid rgba(63,208,255,0.4)", color: "#3FD0FF",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
          transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.35s ease",
        }}>+</span>
      </div>
      <div style={{
        maxHeight: open ? 240 : 0, overflow: "hidden",
        transition: "max-height 0.4s ease, opacity 0.3s ease, margin-top 0.35s ease",
        opacity: open ? 1 : 0, marginTop: open ? 14 : 0,
      }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14.5, lineHeight: 1.75 }}>{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @keyframes faq-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "148px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, background: "linear-gradient(135deg,#3FD0FF,#12E6B4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16.5, lineHeight: 1.8, marginBottom: 44, maxWidth: 560 }}>
          Answers to the questions we hear most from teams evaluating or already running the system.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FAQS.map((f, i) => <FAQItem key={f.q} item={f} index={i} />)}
        </div>
        <div style={{ marginTop: 48, padding: "28px 26px", borderRadius: 18, background: "rgba(63,208,255,0.06)", border: "1px solid rgba(63,208,255,0.2)", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, marginBottom: 16 }}>Still have a question?</p>
          <button
            onClick={() => navigate("/contact")}
            style={{ background: "linear-gradient(135deg,#3FD0FF,#1c8fd6)", color: "#04121f", fontWeight: 800, border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, cursor: "pointer" }}
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
