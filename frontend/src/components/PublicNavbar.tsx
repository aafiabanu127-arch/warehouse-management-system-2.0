import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";

// ─── Shared public-site navbar ─────────────────────────────────────────────
// Used on the Landing page and every marketing sub-page (Services, About,
// Features, Process, Careers, Contact) so the header is always identical.
const NAV_LINKS = ["Home", "Services", "About", "Careers", "Contact"];
const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  services: "/services",
  about: "/about",
  features: "/features",
  process: "/process",
  careers: "/careers",
  contact: "/contact",
};

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (label: string) => {
    const key = label.toLowerCase();
    const route = PAGE_ROUTES[key] ?? "/";
    setMenuOpen(false);

    // On the landing page itself, same-page sections still scroll smoothly.
    if (route === "/" && location.pathname === "/") {
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(route);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(14,19,20,0.87),0 8px 32px rgba(0,212,255,0.2)} 50%{box-shadow:0 0 0 10px rgba(0,212,255,0),0 8px 32px rgba(0,212,255,0.25)} }
    @keyframes slide-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    .nav-link { color:rgba(255,255,255,0.6); text-decoration:none; font-size:14.5px; font-weight:500; padding:9px 16px; border-radius:8px; transition:all 0.25s; cursor:pointer; background:none; border:none; position:relative; font-family:'Inter',sans-serif; }
    .nav-link:hover { color:#00d4ff; background:rgba(0,212,255,0.07); }
    .nav-link.active { color:#00d4ff; }
    .cta-primary { background:linear-gradient(135deg,#00d4ff,#0ea5e9); color:#000; font-weight:800; font-size:14px; padding:14px 32px; border-radius:12px; border:none; cursor:pointer; transition:all 0.3s; animation:pulse-glow 2.5s infinite; position:relative; overflow:hidden; letter-spacing:0.2px; font-family:'Inter',sans-serif; }
    .cta-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 40px rgba(0,212,255,0.4); animation:none; }
    .cta-secondary { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.85); font-weight:600; font-size:14px; padding:14px 32px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); cursor:pointer; transition:all 0.3s; backdrop-filter:blur(10px); letter-spacing:0.2px; font-family:'Inter',sans-serif; }
    .cta-secondary:hover { background:rgba(255,255,255,0.09); border-color:rgba(0,212,255,0.4); color:#00d4ff; transform:translateY(-2px); }

    @media (max-width:768px) { .desktop-nav{display:none!important} .hamburger{display:flex!important} }
  `;

  return (
    <>
      <style>{css}</style>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(1,4,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(140%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(63,208,255,0.10)" : "none",
        transition: "all 0.4s ease", padding: "0 32px",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", height: 84, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => goTo("Home")}>
            <div style={{
              width: 58, height: 58, borderRadius: 16, flexShrink: 0, padding: 8,
              background: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(63,208,255,0.35)",
              boxShadow: "0 4px 18px rgba(63,208,255,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={logoIcon} alt="WSOS logo" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, background: "linear-gradient(135deg,#3FD0FF 30%,#fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.3, lineHeight: 1.2 }}>WSOS</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", lineHeight: 1, marginTop: 4, fontWeight: 600 }}>Warehouse OS</div>
            </div>
          </div>
          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {NAV_LINKS.map(l => {
              const isActive = PAGE_ROUTES[l.toLowerCase()] === location.pathname;
              return (
                <button key={l} className={`nav-link${isActive ? " active" : ""}`} onClick={() => goTo(l)}>{l}</button>
              );
            })}
          </div>
          {/* CTA group */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="cta-secondary" style={{ padding: "10px 22px", fontSize: 14, animation: "none" }} onClick={() => navigate("/login")}>Log In</button>
            <button className="cta-primary" style={{ padding: "10px 24px", fontSize: 14, animation: "none" }} onClick={() => navigate("/register")}>Get Started</button>
          </div>
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(m => !m)} className="hamburger" style={{ display: "none", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 8, padding: "6px 10px", alignItems: "center", justifyContent: "center" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "rgba(2,8,18,0.97)", backdropFilter: "blur(24px)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(0,212,255,0.1)", animation: "slide-up 0.25s ease" }}>
            {NAV_LINKS.map(l => <button key={l} className="nav-link" onClick={() => goTo(l)} style={{ textAlign: "left", padding: "10px 14px" }}>{l}</button>)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <button className="cta-secondary" style={{ fontSize: 13 }} onClick={() => navigate("/login")}>Log In</button>
              <button className="cta-primary" style={{ fontSize: 13 }} onClick={() => navigate("/register")}>Get Started</button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}