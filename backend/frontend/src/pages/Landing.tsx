import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
// ─── Types ────────────────────────────────────────────────────────────────────
interface Job { title: string; dept: string; type: string; reqs: string[]; badge: string; }
interface Metric { label: string; end: number; suffix: string; icon: string; sub: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "📦", title: "3D Space Analysis", desc: "AI-powered volumetric mapping reconstructs your warehouse in real time — dead zones get flagged before they cost you.", color: "#00d4ff", glyph: "S₁" },
  { icon: "🗺️", title: "Layout Planning", desc: "Dynamic floor-plan engine adapts to your SKU velocity, pick paths, and seasonal spikes in under 60 seconds.", color: "#7c3aed", glyph: "S₂" },
  { icon: "📡", title: "Real-Time Tracking", desc: "Live inventory pulse across every rack and zone with millisecond alerts on anomalies — before a human spots them.", color: "#059669", glyph: "S₃" },
  { icon: "🤖", title: "AI Forecasting", desc: "Demand signals from 40+ market data feeds fused with your movement history. Restocking surprises become a thing of the past.", color: "#d97706", glyph: "S₄" },
  { icon: "💰", title: "Cost Reduction", desc: "Intelligent slot assignment cuts carrying costs and labour hours by up to 40%. Every centimetre earns its keep.", color: "#dc2626", glyph: "S₅" },
  { icon: "📊", title: "Smart Reports", desc: "Automated reports with drill-down analytics delivered daily. From C-suite dashboards to floor-staff heatmaps.", color: "#0891b2", glyph: "S₆" },
];

const STATS: Metric[] = [
  { label: "Warehouses Optimized", end: 520, suffix: "+", icon: "🏭", sub: "Across 32 countries" },
  { label: "Client Satisfaction", end: 98, suffix: "%", icon: "⭐", sub: "NPS score 72" },
  { label: "Cost Reduction", end: 40, suffix: "%", icon: "💰", sub: "Average per client" },
  { label: "Uptime SLA", end: 99.97, suffix: "%", icon: "⚡", sub: "Last 12 months" },
];

const FEATURES = [
  { icon: "🏭", title: "Multi-Site Control", desc: "Manage unlimited warehouse sites from one command-centre dashboard.", accent: "#00d4ff" },
  { icon: "⚡", title: "Sub-100ms Response", desc: "Lightning-fast at 10,000+ concurrent users — no throttling, ever.", accent: "#7c3aed" },
  { icon: "🔒", title: "Enterprise Security", desc: "SOC 2 Type II. Role-based access. SSO. End-to-end encryption at rest.", accent: "#059669" },
  { icon: "🌐", title: "Global Scale", desc: "Multi-currency, multi-language across every timezone.", accent: "#d97706" },
  { icon: "📱", title: "Mobile-First Floor App", desc: "Full-feature scan-and-pick app your floor staff will actually want to use.", accent: "#dc2626" },
  { icon: "🔗", title: "ERP Integration", desc: "Native connectors for SAP, Oracle, NetSuite and 20+ WMS platforms.", accent: "#0891b2" },
];

const JOBS: Job[] = [
  { title: "Warehouse Data Analyst", dept: "Analytics", type: "Full-Time", badge: "📊", reqs: ["3+ yrs data analysis", "SQL & Python proficiency", "WMS experience preferred", "Tableau or Power BI"] },
  { title: "Systems Engineer", dept: "Engineering", type: "Full-Time", badge: "⚙️", reqs: ["Backend: Django / Node.js", "REST & WebSocket APIs", "Docker, Kubernetes, CI/CD", "PostgreSQL at scale"] },
  { title: "UX / UI Designer", dept: "Product", type: "Contract", badge: "🎨", reqs: ["Figma expert", "Motion & microinteraction", "Responsive & a11y design", "Portfolio of SaaS products"] },
  { title: "Inventory Specialist", dept: "Operations", type: "Full-Time", badge: "📦", reqs: ["5+ yrs warehouse ops", "ERP systems knowledge", "Team leadership", "Process documentation"] },
];

const PROCESS_STEPS = [
  { num: "01", title: "Discovery Call", desc: "30-minute deep dive into your warehouse layout, throughput, and pain points.", icon: "🔍" },
  { num: "02", title: "AI Scan & Map", desc: "Our sensors + your existing data create a complete digital twin of your facility.", icon: "📡" },
  { num: "03", title: "Insight Report", desc: "Receive a detailed breakdown of waste zones, pick inefficiencies, and ROI projection.", icon: "📊" },
  { num: "04", title: "Go Live", desc: "Deployment in under a week. Your team gets trained. Results start on day one.", icon: "🚀" },
];

// ─── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ end, suffix, active }: { end: number; suffix: string; active: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0; const dur = 1800; const step = 16;
    const inc = end / (dur / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= end) { setVal(end); clearInterval(t); }
      else setVal(end > 10 ? Math.floor(start) : Math.round(start * 100) / 100);
    }, step);
    return () => clearInterval(t);
  }, [active, end]);
  return <span>{end === 99.97 ? (active ? val.toFixed(2) : "0.00") : val}{suffix}</span>;
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    let W = canvas.width = canvas.offsetWidth; let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.3, pulse: Math.random() * Math.PI * 2,
    }));
    let raf: number; let t = 0;
    const draw = () => {
      t += 0.02; ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.03;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const r = p.r * (0.8 + 0.2 * Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.3 + 0.2 * Math.sin(p.pulse)})`; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - d / 130)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(() => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />;
}

// ─── Explode Shard Card (enhanced) ───────────────────────────────────────────
function ExplodeCard({ icon, title, desc, color, glyph, delay }: { icon: string; title: string; desc: string; color: string; glyph: string; delay: number }) {
  const { ref, inView } = useInView(0.1);
  const [phase, setPhase] = useState<"pre" | "flying" | "settled">("pre");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setPhase("flying"), delay);
    const t2 = setTimeout(() => setPhase("settled"), delay + 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView, delay]);

  const shards = [
    { clip: "polygon(0 0,55% 0,35% 55%,0 100%)", tx: -80, ty: -60, rot: -15 },
    { clip: "polygon(55% 0,100% 0,100% 45%,65% 55%)", tx: 80, ty: -60, rot: 20 },
    { clip: "polygon(0 100%,35% 55%,65% 100%)", tx: -50, ty: 70, rot: -10 },
    { clip: "polygon(65% 55%,100% 45%,100% 100%,65% 100%)", tx: 70, ty: 70, rot: 15 },
    { clip: "polygon(35% 55%,65% 55%,65% 100%,35% 100%)", tx: 0, ty: 90, rot: 5 },
    { clip: "polygon(35% 0%,65% 0,65% 55%,35% 55%)", tx: 0, ty: -90, rot: -8 },
  ];

  return (
    <div ref={ref} style={{ position: "relative", height: 210 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Explosion shards */}
      {phase !== "settled" && shards.map((s, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${color}22, ${color}08)`,
          backdropFilter: "blur(4px)",
          clipPath: s.clip,
          transform: phase === "flying"
            ? `translate(${s.tx}px,${s.ty}px) rotate(${s.rot}deg) scale(0.3)`
            : "translate(0,0) rotate(0deg) scale(1)",
          opacity: phase === "flying" ? 0 : 1,
          transition: `all 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 30}ms`,
          borderRadius: 14, border: `1px solid ${color}30`,
        }} />
      ))}
      {/* Main card */}
      <div style={{
        position: "absolute", inset: 0,
        background: hovered ? `linear-gradient(135deg, ${color}14, rgba(255,255,255,0.04))` : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? color + "60" : color + "25"}`,
        borderRadius: 16, padding: "28px 24px",
        opacity: phase === "settled" ? 1 : 0,
        transform: phase === "settled" ? (hovered ? "scale(1.03) translateY(-4px)" : "scale(1) translateY(0)") : "scale(0.9) translateY(20px)",
        transition: "opacity 0.45s ease 0.1s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s, border-color 0.3s, background 0.3s",
        boxShadow: hovered ? `0 16px 48px ${color}22, 0 4px 16px rgba(0,0,0,0.4)` : "0 4px 24px rgba(0,0,0,0.3)",
        cursor: "default", overflow: "hidden",
      }}>
        {/* Corner glyph */}
        <div style={{ position: "absolute", top: 14, right: 16, color: `${color}40`, fontSize: 11, fontWeight: 800, letterSpacing: 1, fontFamily: "monospace" }}>{glyph}</div>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius: 1, opacity: hovered ? 1 : 0, transition: "opacity 0.3s" }} />
        <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
        <h3 style={{ color: color, fontWeight: 700, marginBottom: 8, fontSize: 15, letterSpacing: 0.2 }}>{title}</h3>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── 3D Orbital Slider ─────────────────────────────────────────────────────────
function OrbitalSlider3D() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const n = FEATURES.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActive(a => (a + 1) % n), 3500);
  }, [n]);

  useEffect(() => { resetInterval(); return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [resetInterval]);

  const goTo = (i: number) => { setActive(i); resetInterval(); };
  const next = () => goTo((active + 1) % n);
  const prev = () => goTo((active - 1 + n) % n);

  // Drag to slide
  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); setDragStart(e.clientX); };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    if (e.clientX - dragStart > 60) { prev(); setDragging(false); }
    else if (dragStart - e.clientX > 60) { next(); setDragging(false); }
  };
  const onMouseUp = () => setDragging(false);

  const getCardStyle = (i: number) => {
    const offset = ((i - active + n) % n);
    const positions: Record<number, { tx: number; scale: number; opacity: number; z: number; rotY: number; rotZ: number; brightness: number }> = {
      0: { tx: 0, scale: 1, opacity: 1, z: 20, rotY: 0, rotZ: 0, brightness: 1 },
      1: { tx: 340, scale: 0.72, opacity: 0.6, z: 10, rotY: -35, rotZ: 0, brightness: 0.6 },
      2: { tx: 500, scale: 0.5, opacity: 0.25, z: 5, rotY: -50, rotZ: 0, brightness: 0.4 },
      [n - 1]: { tx: -340, scale: 0.72, opacity: 0.6, z: 10, rotY: 35, rotZ: 0, brightness: 0.6 },
      [n - 2]: { tx: -500, scale: 0.5, opacity: 0.25, z: 5, rotY: 50, rotZ: 0, brightness: 0.4 },
    };
    return positions[offset] ?? { tx: 0, scale: 0.3, opacity: 0, z: 0, rotY: 0, rotZ: 0, brightness: 0 };
  };

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      {/* Track */}
      <div style={{ perspective: "1400px", height: 340, position: "relative", overflow: "hidden" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        {/* Glow track line */}
        <div style={{ position: "absolute", bottom: 20, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.15), rgba(0,212,255,0.35), rgba(0,212,255,0.15), transparent)", pointerEvents: "none" }} />

        {FEATURES.map((item, i) => {
          const s = getCardStyle(i);
          const isCenter = ((i - active + n) % n) === 0;
          return (
            <div key={i} onClick={() => goTo(i)} style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `translateX(calc(-50% + ${s.tx}px)) translateY(-50%) scale(${s.scale}) rotateY(${s.rotY}deg)`,
              opacity: s.opacity, zIndex: s.z, cursor: isCenter ? "default" : "pointer",
              transition: dragging ? "none" : "all 0.65s cubic-bezier(0.34,1.56,0.64,1)",
              width: 310, filter: `brightness(${s.brightness})`,
            }}>
              <div style={{
                background: isCenter
                  ? `linear-gradient(135deg, ${item.accent}18, rgba(255,255,255,0.05))`
                  : "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                border: `1px solid ${isCenter ? item.accent + "60" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 22, padding: "44px 32px 36px",
                boxShadow: isCenter ? `0 0 60px ${item.accent}22, 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
                textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                {/* Top accent */}
                {isCenter && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`, borderRadius: "22px 22px 0 0" }} />}
                {/* Corner hexagon decoration */}
                <div style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, border: `1px solid ${item.accent}40`, borderRadius: 6, transform: "rotate(15deg)", opacity: isCenter ? 0.8 : 0.3 }} />
                <div style={{ fontSize: 48, marginBottom: 18, filter: isCenter ? "drop-shadow(0 0 12px rgba(255,255,255,0.2))" : "none" }}>{item.icon}</div>
                <h3 style={{ color: isCenter ? item.accent : "#fff", fontWeight: 800, marginBottom: 12, fontSize: 19, letterSpacing: -0.3 }}>{item.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
                {isCenter && (
                  <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 32, height: 3, background: item.accent, borderRadius: 2 }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 48 }}>
        <button onClick={prev} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#00d4ff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}>‹</button>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {FEATURES.map((_item, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === active ? 36 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
              background: i === active ? FEATURES[active].accent : "rgba(255,255,255,0.18)",
              boxShadow: i === active ? `0 0 10px ${FEATURES[active].accent}70` : "none",
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          ))}
        </div>

        <button onClick={next} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#00d4ff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}>›</button>
      </div>

      {/* Active label */}
      <div style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.35)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
        {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} — {FEATURES[active].title}
      </div>
    </div>
  );
}

// ─── Flip Card (upgraded) ─────────────────────────────────────────────────────
function FlipCard({ job }: { job: Job }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ perspective: 1200, height: 240, cursor: "pointer" }}
      onClick={() => setFlipped(f => !f)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : hovered ? "rotateY(8deg)" : "rotateY(0deg)",
        transition: "transform 0.65s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          border: `1px solid rgba(0,212,255,${hovered ? 0.35 : 0.15})`,
          borderRadius: 18, padding: "28px 24px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,212,255,0.08)" : "0 4px 20px rgba(0,0,0,0.3)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ color: "#00d4ff", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{job.dept}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 8px" }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>{job.type}</span>
              </div>
              <span style={{ fontSize: 26 }}>{job.badge}</span>
            </div>
            <h3 style={{ color: "#fff", fontSize: 19, fontWeight: 800, lineHeight: 1.25, marginBottom: 12, letterSpacing: -0.3 }}>{job.title}</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Flip to see requirements</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff", fontSize: 14, transition: "transform 0.3s", transform: hovered ? "rotate(45deg)" : "rotate(0deg)" }}>↻</div>
          </div>
        </div>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(14,165,233,0.04))",
          backdropFilter: "blur(20px)", border: "1px solid rgba(0,212,255,0.35)",
          borderRadius: 18, padding: "24px", transform: "rotateY(180deg)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 12px 40px rgba(0,212,255,0.12)",
        }}>
          <div>
            <h4 style={{ color: "#00d4ff", fontSize: 13, fontWeight: 800, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1.5 }}>Requirements</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {job.reqs.map((r, i) => (
                <li key={i} style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, paddingLeft: 20, position: "relative", lineHeight: 1.4 }}>
                  <span style={{ position: "absolute", left: 0, color: "#00d4ff", fontWeight: 700 }}>✓</span>{r}
                </li>
              ))}
            </ul>
          </div>
          <button style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 10, color: "#000", fontWeight: 800, padding: "11px 20px", cursor: "pointer", fontSize: 13, letterSpacing: 0.3, boxShadow: "0 4px 20px rgba(0,212,255,0.3)" }}>
            Apply Now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Floating 3D Warehouse Cube ────────────────────────────────────────────────
function HeroCube() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setAngle(a => a + 0.4), 30);
    return () => clearInterval(t);
  }, []);
  const rad = angle * Math.PI / 180;
  const cos = Math.cos(rad); const sin = Math.sin(rad);
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 64 }}>
      <div style={{ width: 140, height: 140, position: "relative", filter: "drop-shadow(0 20px 60px rgba(0,212,255,0.2))" }}>
        <svg viewBox="-80 -80 160 160" width={140} height={140}>
          <defs>
            <linearGradient id="face1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
              <stop offset="100%" stopColor="rgba(14,165,233,0.1)" />
            </linearGradient>
          </defs>
          {(() => {
            const s = 48;
            const verts = [[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
            const rotate = ([x,y,z]: number[]) => {
              const x2 = x*cos - z*sin; const z2 = x*sin + z*cos;
              const iso = 0.5; const x3 = x2 - z2*iso; const y3 = y + z2*iso * 0.6;
              return [x3, y3];
            };
            const faces = [
              { verts: [4,5,6,7], fill: "rgba(0,212,255,0.18)", stroke: "rgba(0,212,255,0.7)" },
              { verts: [0,1,5,4], fill: "rgba(0,212,255,0.10)", stroke: "rgba(0,212,255,0.45)" },
              { verts: [1,2,6,5], fill: "rgba(0,212,255,0.08)", stroke: "rgba(0,212,255,0.35)" },
            ];
            return faces.map((f, fi) => {
              const pts = f.verts.map(vi => rotate(verts[vi])).map(([x,y]) => `${x},${y}`).join(" ");
              return <polygon key={fi} points={pts} fill={f.fill} stroke={f.stroke} strokeWidth={1.5} />;
            });
          })()}
          <text textAnchor="middle" dominantBaseline="central" fontSize={28} y={0}>🏭</text>
        </svg>
      </div>
    </div>
  );
}

// ─── Process Step Card ─────────────────────────────────────────────────────────
function ProcessStep({ step, idx }: { step: typeof PROCESS_STEPS[0]; idx: number }) {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.12)"}`,
        borderRadius: 18, padding: "32px 28px", position: "relative",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${idx * 120}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 120}ms, background 0.3s, border-color 0.3s`,
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.2)",
        backdropFilter: "blur(16px)", cursor: "default",
      }}>
      {/* Step number badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#00d4ff", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{step.num}</span>
        </div>
        <span style={{ fontSize: 28 }}>{step.icon}</span>
      </div>
      {/* Connector line (except last) */}
      {idx < PROCESS_STEPS.length - 1 && (
        <div style={{ position: "absolute", top: "50%", right: -1, transform: "translateY(-50%)", width: 1, height: "60%", background: "linear-gradient(180deg, transparent, rgba(0,212,255,0.25), transparent)", display: "none" }} />
      )}
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 10, letterSpacing: -0.2 }}>{step.title}</h3>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.65 }}>{step.desc}</p>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView();
  return (
    <section id={id} ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(48px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
      padding: "110px 24px", maxWidth: 1140, margin: "0 auto", ...style,
    }}>
      {children}
    </section>
  );
}

function SectionLabel({ children, accent = "#00d4ff" }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${accent}12`, border: `1px solid ${accent}35`, color: accent, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", borderRadius: 999, padding: "6px 20px" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block" }} />
        {children}
      </span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ textAlign: "center", fontSize: "clamp(30px,4vw,52px)", fontWeight: 900, color: "#fff", marginBottom: 12, lineHeight: 1.1, letterSpacing: -1.5 }}>{children}</h2>;
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", maxWidth: 580, margin: "0 auto 56px", fontSize: 16, lineHeight: 1.75 }}>{children}</p>;
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const [contactSent, setContactSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const { ref: statsRef, inView: statsInView } = useInView();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const pageRoutes: Record<string, string> = {
      services: "/services", about: "/about", features: "/features",
      process: "/process", careers: "/careers", contact: "/contact",
    };
    const key = id.toLowerCase();
    if (pageRoutes[key]) { navigate(pageRoutes[key]); return; }
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #020810; font-family: 'Inter', sans-serif; color: #fff; overflow-x: hidden; }
    ::selection { background: rgba(3, 10, 11, 0.86); }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #040c1a; }
    ::-webkit-scrollbar-thumb { background: rgba(8, 18, 19, 0.9); border-radius: 3px; }
    
    @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(14, 19, 20, 0.87),0 8px 32px rgba(0,212,255,0.2)} 50%{box-shadow:0 0 0 10px rgba(0,212,255,0),0 8px 32px rgba(0,212,255,0.25)} }
    @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-10px) rotate(0.5deg)} 66%{transform:translateY(-6px) rotate(-0.5deg)} }
    @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes slide-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes rotate-hue { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
    @keyframes grid-fade { from{opacity:0} to{opacity:1} }
    @keyframes nav-underline { from{width:0} to{width:100%} }
    
    .nav-link { color:rgba(255,255,255,0.6); text-decoration:none; font-size:13.5px; font-weight:500; padding:6px 14px; border-radius:8px; transition:all 0.25s; cursor:pointer; background:none; border:none; position:relative; }
    .nav-link:hover { color:#00d4ff; background:rgba(0,212,255,0.07); }
    .cta-primary { background:linear-gradient(135deg,#00d4ff,#0ea5e9); color:#000; font-weight:800; font-size:14px; padding:14px 32px; border-radius:12px; border:none; cursor:pointer; transition:all 0.3s; animation:pulse-glow 2.5s infinite; position:relative; overflow:hidden; letter-spacing:0.2px; }
    .cta-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 40px rgba(0,212,255,0.4); animation:none; }
    .cta-secondary { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.85); font-weight:600; font-size:14px; padding:14px 32px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); cursor:pointer; transition:all 0.3s; backdrop-filter:blur(10px); letter-spacing:0.2px; }
    .cta-secondary:hover { background:rgba(255,255,255,0.09); border-color:rgba(0,212,255,0.4); color:#00d4ff; transform:translateY(-2px); }
    .glass-input { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); color:#fff; border-radius:11px; padding:14px 16px; font-size:14px; width:100%; font-family:inherit; transition:all 0.3s; outline:none; }
    .glass-input:focus { border-color:#00d4ff; box-shadow:0 0 0 3px rgba(0,212,255,0.1); background:rgba(0,212,255,0.03); }
    .glass-input::placeholder { color:rgba(255,255,255,0.22); }
    .send-btn { background:linear-gradient(135deg,#00d4ff,#0ea5e9); border:none; border-radius:11px; color:#000; font-weight:800; padding:16px 40px; cursor:pointer; font-size:14.5px; width:100%; transition:all 0.3s; letter-spacing:0.3px; }
    .send-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,212,255,0.4); }
    .stat-card:hover { transform:translateY(-4px); }
    
    @media (max-width:768px) { .desktop-nav{display:none!important} .hamburger{display:flex!important} }
    @media (max-width:640px) { .hero-btns{flex-direction:column;align-items:stretch} }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ background: "#020810", minHeight: "100vh", position: "relative" }}>

        {/* ── Navbar ── */}
        <PublicNavbar />

        {/* ── Hero ── */}
        <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <Particles />
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none", animation: "grid-fade 2s ease forwards", zIndex: 1 }} />
          {/* Atmospheric blobs */}
          <div style={{ position: "absolute", top: "15%", left: "5%", width: 500, height: 500, background: "rgba(0,212,255,0.04)", borderRadius: "50%", filter: "blur(90px)", animation: "float 8s ease-in-out infinite", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 380, height: 380, background: "rgba(124,58,237,0.06)", borderRadius: "50%", filter: "blur(70px)", animation: "float 10s ease-in-out infinite reverse", zIndex: 0 }} />
          <div style={{ position: "absolute", top: "55%", left: "40%", width: 280, height: 280, background: "rgba(5,150,105,0.04)", borderRadius: "50%", filter: "blur(60px)", animation: "float 7s ease-in-out infinite 2s", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", padding: "130px 24px 80px", textAlign: "center" }}>
            {/* Live badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.22)", borderRadius: 999, padding: "7px 20px", marginBottom: 36, fontSize: 12.5, color: "#00d4ff", fontWeight: 600, animation: "slide-up 0.6s ease" }}>
              <span style={{ width: 7, height: 7, background: "#00d4ff", borderRadius: "50%", animation: "blink 1.8s ease-in-out infinite", display: "inline-block", boxShadow: "0 0 6px #00d4ff" }} />
              Live · 520+ Warehouses Optimized Worldwide
            </div>
            {/* Hero headline */}
            <h1 style={{ fontSize: "clamp(38px,6.5vw,88px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 28, letterSpacing: "-2.5px", animation: "slide-up 0.7s ease 0.1s both" }}>
              <span style={{ background: "linear-gradient(135deg,#fff 50%,rgba(255,255,255,0.45))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block" }}>Warehouse Space</span>
              <span style={{ background: "linear-gradient(135deg,#00d4ff 20%,#7c3aed 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block" }}>Optimization System</span>
            </h1>
            <p style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.5)", maxWidth: 620, margin: "0 auto 52px", lineHeight: 1.8, animation: "slide-up 0.7s ease 0.2s both" }}>
              AI-powered space analysis, real-time tracking, and intelligent layout planning — built for the warehouses that can't afford downtime.
            </p>
            <div className="hero-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "slide-up 0.7s ease 0.3s both" }}>
              <button className="cta-primary" onClick={() => scrollTo("contact")}>Start Optimizing →</button>
              <button className="cta-secondary" onClick={() => scrollTo("services")}>See All Features</button>
            </div>
            {/* Rotating 3D cube */}
            <div style={{ animation: "float 5s ease-in-out infinite" }}>
              <HeroCube />
            </div>
            {/* Scroll indicator */}
            <div style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }} onClick={() => scrollTo("stats")}>
              <span>Scroll</span>
              <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,rgba(0,212,255,0.5),transparent)" }} />
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div id="stats" style={{ background: "rgba(0,212,255,0.025)", borderTop: "1px solid rgba(0,212,255,0.07)", borderBottom: "1px solid rgba(0,212,255,0.07)" }}>
          <div ref={statsRef} style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-card" style={{ textAlign: "center", padding: "28px 20px", background: "rgba(255,255,255,0.025)", borderRadius: 16, border: "1px solid rgba(0,212,255,0.1)", transition: "transform 0.3s, box-shadow 0.3s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,212,255,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 900, background: "linear-gradient(135deg,#00d4ff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>
                  <Counter end={s.end} suffix={s.suffix} active={statsInView} />
                </div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Services ── */}
        <Section id="services">
          <SectionLabel>What We Do</SectionLabel>
          <H2>Services Built for Scale</H2>
          <Kicker>Every module is engineered to reduce waste, accelerate throughput, and give you full visibility — from the loading bay to the boardroom.</Kicker>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20 }}>
            {SERVICES.map((s, i) => (
              <ExplodeCard key={i} icon={s.icon} title={s.title} desc={s.desc} color={s.color} glyph={s.glyph} delay={i * 90} />
            ))}
          </div>
        </Section>

        {/* ── About ── */}
        <div id="about" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Section style={{ padding: "110px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 72, alignItems: "center" }}>
              <div>
                <SectionLabel accent="#7c3aed">About Us</SectionLabel>
                <h2 style={{ fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 22, letterSpacing: -1.2, marginTop: 16 }}>
                  We turn warehouse chaos into<br /><span style={{ background: "linear-gradient(135deg,#00d4ff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>operational clarity</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.85, marginBottom: 24, fontSize: 15 }}>
                  Built by logistics engineers and data scientists who lived the problem — warehouses bursting at the seams while shelves sat half-empty two aisles over.
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.85, fontSize: 15, marginBottom: 32 }}>
                  Our platform fuses IoT sensor data, AI demand forecasting, and human-centred design to give your team tools they actually want to use.
                </p>
                <button className="cta-secondary" onClick={() => scrollTo("contact")} style={{ fontSize: 14 }}>Talk to us →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Mission", text: "Eliminate wasted space and motion from every warehouse on earth.", icon: "🎯", color: "#00d4ff" },
                  { label: "Vision", text: "A world where inventory is always in the right place at the right time.", icon: "🔭", color: "#7c3aed" },
                  { label: "Values", text: "Transparency, precision, and relentless iteration with our clients.", icon: "💎", color: "#059669" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 22px",
                    display: "flex", gap: 16, alignItems: "flex-start", transition: "all 0.3s", cursor: "default",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${item.color}50`; el.style.background = `${item.color}09`; el.style.transform = "translateX(6px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.03)"; el.style.transform = "translateX(0)"; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ color: item.color, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 5 }}>{item.label}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ── 3D Orbital Feature Slider ── */}
        <div id="features" style={{ padding: "110px 24px" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto" }}>
            <SectionLabel accent="#059669">Platform Highlights</SectionLabel>
            <H2>Built Different</H2>
            <Kicker>Drag or use arrows to explore. Six reasons WSOS outperforms legacy WMS tools.</Kicker>
            <OrbitalSlider3D />
          </div>
        </div>

        {/* ── Process ── */}
        <div id="process" style={{ background: "rgba(0,212,255,0.015)", borderTop: "1px solid rgba(0,212,255,0.06)", borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
          <Section style={{ padding: "110px 24px" }}>
            <SectionLabel accent="#d97706">How It Works</SectionLabel>
            <H2>From Signed Contract to Live Dashboard in 7 Days</H2>
            <Kicker>No month-long implementation. No army of consultants. We move at warehouse speed.</Kicker>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16, position: "relative" }}>
              {/* Connector between cards (desktop only) */}
              <div style={{ position: "absolute", top: "36px", left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.15),rgba(0,212,255,0.3),rgba(0,212,255,0.15),transparent)", pointerEvents: "none", zIndex: 0 }} />
              {PROCESS_STEPS.map((s, i) => <ProcessStep key={i} step={s} idx={i} />)}
            </div>
          </Section>
        </div>

        {/* ── Careers ── */}
        <Section id="careers">
          <SectionLabel accent="#dc2626">Join the Team</SectionLabel>
          <H2>Open Positions</H2>
          <Kicker>Flip each card to see requirements. Remote-first across 32 countries — apply in 3 minutes.</Kicker>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20 }}>
            {JOBS.map((job, i) => <FlipCard key={i} job={job} />)}
          </div>
        </Section>

        {/* ── Contact ── */}
        <div id="contact" style={{ background: "rgba(0,212,255,0.015)", borderTop: "1px solid rgba(0,212,255,0.06)" }}>
          <Section style={{ padding: "110px 24px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <SectionLabel>Get In Touch</SectionLabel>
              <H2>Let's Talk Optimization</H2>
              <Kicker>Whether you manage 1 warehouse or 500, we'll tailor a live demo to your exact operation — no generic decks.</Kicker>
              <div style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)", border: "1px solid rgba(0,212,255,0.14)", borderRadius: 24, padding: "48px 44px", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
                {contactSent ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: 60, marginBottom: 18 }}>✅</div>
                    <h3 style={{ color: "#00d4ff", fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>You're on the list.</h3>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>Our team will reach out within 24 hours to schedule your walkthrough.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Full Name</label>
                        <input className="glass-input" placeholder="Jane Smith" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                      <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Work Email</label>
                        <input className="glass-input" type="email" placeholder="jane@acme.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                    </div>
                    <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Company</label>
                      <input className="glass-input" placeholder="Acme Logistics" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} /></div>
                    <div><label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Tell Us Your Challenge</label>
                      <textarea className="glass-input" rows={5} placeholder="Describe your warehouse setup, current pain points, or goals..." style={{ resize: "none" }} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} /></div>
                    <button className="send-btn" onClick={() => setContactSent(true)}>Send Message ✈</button>
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>No spam. We respond within 1 business day.</p>
                  </div>
                )}
              </div>
              {/* Trust row */}
              <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40, flexWrap: "wrap" }}>
                {[{ icon: "🔒", label: "SOC 2 Type II" }, { icon: "⚡", label: "99.97% Uptime" }, { icon: "🌐", label: "32 Countries" }].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                    <span>{t.icon}</span><span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px)" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 24px 36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 44, marginBottom: 52 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(0,212,255,0.25)" }}>📦</div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 15, background: "linear-gradient(135deg,#00d4ff,#fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WSOS</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase" }}>Warehouse OS</div>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13.5, lineHeight: 1.75, maxWidth: 220 }}>Turning storage complexity into operational simplicity — one warehouse at a time.</p>
              </div>
              {[
                { heading: "Platform", links: ["Dashboard", "Analytics", "Forecasting", "Reports", "API"] },
                { heading: "Company", links: ["About", "Careers", "Blog", "Press", "Partners"] },
                { heading: "Support", links: ["Docs", "Status", "Community", "Contact", "Security"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>{col.heading}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {col.links.map(l => <a key={l} href="#" style={{ color: "rgba(255,255,255,0.28)", fontSize: 13.5, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#00d4ff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}>{l}</a>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>© 2026 Warehouse Space Optimization System. All rights reserved.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[["𝕏", "#"], ["in", "#"], ["📧", "#"]].map(([icon, href], i) => (
                  <a key={i} href={href} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", fontSize: 14, textDecoration: "none", transition: "all 0.25s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(0,212,255,0.4)"; el.style.color = "#00d4ff"; el.style.background = "rgba(0,212,255,0.08)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.color = "rgba(255,255,255,0.35)"; el.style.background = "rgba(255,255,255,0.04)"; }}>{icon}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}