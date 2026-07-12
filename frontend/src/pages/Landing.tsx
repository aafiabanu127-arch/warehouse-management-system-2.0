import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import logoFull from "../assets/logo-full.png";
import imgConveyor from "../assets/showcase-conveyor.jpg";
import imgCommand from "../assets/showcase-command.jpg";
import imgFloor from "../assets/showcase-floor.jpg";
import imgDispatch from "../assets/showcase-dispatch.jpg";

// ─── Palette ── deep, darker "Ocean" (darker than #0F1F40) + bioluminescent glow ──
const OCEAN = {
  deep: "#020610",     // page base — near-black abyss
  line: "rgba(255,255,255,0.09)",
  glow: "#3FD0FF",     // bioluminescent cyan — the one accent risk
  glow2: "#12E6B4",    // deep-sea teal, used sparingly
};

// ─── Content ──────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "📦", title: "3D Space Analysis", desc: "Volumetric mapping reconstructs your warehouse in real time, flagging dead zones before they cost you." },
  { icon: "🗺️", title: "Layout Planning", desc: "A dynamic floor-plan engine adapts to SKU velocity, pick paths, and seasonal spikes in under a minute." },
  { icon: "📡", title: "Real-Time Tracking", desc: "A live inventory pulse across every rack and zone, with alerts on anomalies the moment they surface." },
  { icon: "🤖", title: "AI Forecasting", desc: "Demand signals fused with your movement history, so restocking surprises become a thing of the past." },
  { icon: "💰", title: "Cost Reduction", desc: "Intelligent slot assignment cuts carrying costs and labour hours by up to 40%." },
  { icon: "📊", title: "Smart Reports", desc: "Automated, drill-down reports — from floor-staff heatmaps to boardroom summaries." },
];

const STATS = [
  { label: "Products Tracked", end: 12500, suffix: "+", decimals: 0 },
  { label: "Warehouses Managed", end: 48, suffix: "+", decimals: 0 },
  { label: "Pick Accuracy", end: 99.6, suffix: "%", decimals: 1 },
  { label: "Faster Stock Audits", end: 40, suffix: "%", decimals: 0 },
];

const TEAM = [
  { name: "Aafiya Banu", role: "Project Manager & Documentation", icon: "📋", desc: "Coordinates the team, maintains the project timeline, and prepares the SRS, report, presentation, and user documentation." },
  { name: "Kayathri", role: "Frontend Developer", icon: "🎨", desc: "Designs the interface with HTML, CSS, and React, keeps it responsive, and wires it up to the APIs." },
  { name: "Kanchana", role: "Backend Developer", icon: "⚙️", desc: "Builds the backend on Django REST Framework — APIs, authentication, and the core business logic." },
  { name: "Jora", role: "Database Administrator", icon: "🗄️", desc: "Designs the schema, manages models, migrations, and relationships, and tunes performance." },
  { name: "Uwise", role: "Testing & Deployment Engineer", icon: "🧪", desc: "Tests the system, fixes bugs, integrates frontend with backend, and verifies it's ready to ship." },
];

const OPENINGS = [
  { title: "Warehouse Data Analyst", dept: "Analytics", type: "Full-Time", icon: "📊" },
  { title: "Systems Engineer", dept: "Engineering", type: "Full-Time", icon: "🛠️" },
  { title: "UX / UI Designer", dept: "Product", type: "Contract", icon: "🎯" },
];

const SHOWCASE = [
  { img: imgConveyor, tag: "Fulfilment", title: "Automated Conveyor Sorting", desc: "Outbound cartons route themselves — scanned, sorted, and staged for dispatch without a single manual handoff.", stat: { end: 1200, suffix: "/hr", label: "Parcels Sorted" } },
  { img: imgCommand, tag: "Command Center", title: "One Screen, Every Site", desc: "Live world maps, throughput charts, and fleet routes — every warehouse you run, watched from a single control room.", stat: { end: 32, suffix: "", label: "Sites Live-Monitored" } },
  { img: imgFloor, tag: "Floor Operations", title: "Coordinated Floor Teams", desc: "Pickers, forklifts, and pallets move to a plan the system writes in real time, so nobody is ever waiting on anybody.", stat: { end: 27, suffix: "%", label: "Faster Pick Cycles" } },
  { img: imgDispatch, tag: "Dispatch", title: "Loading Docks, Synced", desc: "Every truck knows its slot before it arrives. Loading windows are booked, tracked, and cleared automatically.", stat: { end: 98, suffix: "%", label: "On-Time Dispatch" } },
];

// ─── Hooks ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Same as useInView, but keeps re-arming — so an element that scrolls out and
// back into view (or is revisited) triggers its animation again each time.
function useInViewRepeat(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(end: number, active: boolean, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) {
      setVal(0);
      return;
    }
    const dur = 1700;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end]);
  return decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
}

// ─── Shared glass style ─────────────────────────────────────────────────────
const glassPanel = (accent = "rgba(255,255,255,0.14)"): React.CSSProperties => ({
  background: "linear-gradient(155deg, rgba(255,255,255,0.09), rgba(255,255,255,0.015))",
  backdropFilter: "blur(22px) saturate(140%)",
  WebkitBackdropFilter: "blur(22px) saturate(140%)",
  border: `1px solid ${accent}`,
  borderTop: "1px solid rgba(255,255,255,0.28)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
  borderRadius: 24,
});

// ─── Small building blocks ──────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.15);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 0.7s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function ServiceCard({ s, i }: { s: typeof SERVICES[number]; i: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Reveal delay={i * 90}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...glassPanel(hover ? "rgba(63,208,255,0.45)" : OCEAN.line),
          padding: "30px 26px",
          height: "100%",
          transform: hover ? "translateY(-8px) scale(1.015)" : "translateY(0) scale(1)",
          boxShadow: hover
            ? "0 26px 60px rgba(63,208,255,0.16), 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)"
            : glassPanel().boxShadow,
          transition: "transform 0.45s cubic-bezier(.2,.7,.2,1), box-shadow 0.45s ease, border-color 0.45s ease",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, marginBottom: 18, background: "rgba(63,208,255,0.10)", border: "1px solid rgba(63,208,255,0.22)",
          transform: hover ? "scale(1.08) rotate(-4deg)" : "scale(1)", transition: "transform 0.4s ease",
        }}>{s.icon}</div>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10, letterSpacing: -0.2 }}>{s.title}</h3>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14.5, lineHeight: 1.7 }}>{s.desc}</p>
      </div>
    </Reveal>
  );
}

function TeamCard({ m, i }: { m: typeof TEAM[number]; i: number }) {
  const [hover, setHover] = useState(false);
  const initials = m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Reveal delay={i * 90}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...glassPanel(hover ? "rgba(18,230,180,0.4)" : OCEAN.line),
          padding: "28px 24px",
          height: "100%",
          transform: hover ? "translateY(-8px)" : "translateY(0)",
          transition: "transform 0.45s cubic-bezier(.2,.7,.2,1), border-color 0.4s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(155deg,#12E6B4,#3FD0FF)", color: "#03101c", fontWeight: 900, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 18px rgba(18,230,180,0.28)",
          }}>{initials}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{m.name}</div>
            <div style={{ color: OCEAN.glow2, fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>{m.icon} {m.role}</div>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.7 }}>{m.desc}</p>
      </div>
    </Reveal>
  );
}

function StatBlock({ stat, i }: { stat: typeof STATS[number]; i: number }) {
  const { ref, inView } = useInViewRepeat(0.5);
  const val = useCountUp(stat.end, inView, stat.decimals);
  return (
    <Reveal delay={i * 80}>
      <div ref={ref} style={{ textAlign: "center", padding: "8px 12px" }}>
        <div style={{
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontWeight: 700,
          fontSize: "clamp(30px,4vw,44px)", color: "#fff", letterSpacing: -1,
          textShadow: `0 0 26px ${OCEAN.glow}55`,
        }}>
          {val}{stat.suffix}
        </div>
        <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 13, marginTop: 8, letterSpacing: 0.3 }}>{stat.label}</div>
      </div>
    </Reveal>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
function ShowcaseRow({ item, index }: { item: typeof SHOWCASE[number]; index: number }) {
  const reversed = index % 2 === 1;
  const { ref: statRef, inView: statInView } = useInViewRepeat(0.55);
  const statVal = useCountUp(item.stat.end, statInView, 0);
  const [hover, setHover] = useState(false);

  return (
    <Reveal delay={80}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Image card */}
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            order: reversed ? 2 : 1,
            position: "relative", borderRadius: 26, overflow: "hidden", aspectRatio: "4 / 3.1",
            ...glassPanel(hover ? "rgba(63,208,255,0.4)" : OCEAN.line),
            padding: 0,
            transform: hover ? "translateY(-6px) scale(1.012)" : "translateY(0) scale(1)",
            transition: "transform 0.5s cubic-bezier(.2,.7,.2,1), border-color 0.4s ease",
          }}
        >
          <img src={item.img} alt={item.title} style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: "saturate(1.05) contrast(1.03)",
            transform: hover ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.7s cubic-bezier(.2,.7,.2,1)",
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(2,6,16,0.55), transparent 45%)" }} />
          <div style={{ position: "absolute", left: 18, top: 18, ...glassPanel(), padding: "6px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: OCEAN.glow }}>
            {item.tag.toUpperCase()}
          </div>
        </div>

        {/* Text / stat card */}
        <div style={{ order: reversed ? 1 : 2, padding: "4px 4px" }}>
          <h3 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, letterSpacing: -0.6, marginBottom: 14, color: "#fff" }}>{item.title}</h3>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15.5, lineHeight: 1.8, marginBottom: 24, maxWidth: 460 }}>{item.desc}</p>
          <div ref={statRef} style={{ display: "inline-flex", alignItems: "baseline", gap: 10, ...glassPanel(), padding: "14px 22px", borderRadius: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 26, color: OCEAN.glow2, textShadow: `0 0 20px ${OCEAN.glow2}50` }}>
              {statVal}{item.stat.suffix}
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>{item.stat.label}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: OCEAN.deep, minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
        .glow-cta { background:linear-gradient(135deg,${OCEAN.glow},#1c8fd6); color:#04121f; font-weight:800; border:none; border-radius:14px; padding:16px 34px; font-size:15px; cursor:pointer; transition:transform .3s ease, box-shadow .3s ease; box-shadow:0 12px 34px rgba(63,208,255,0.28); }
        .glow-cta:hover { transform:translateY(-3px); box-shadow:0 18px 44px rgba(63,208,255,0.42); }
        .ghost-cta { background:rgba(255,255,255,0.05); color:#fff; font-weight:600; border:1px solid rgba(255,255,255,0.18); border-radius:14px; padding:16px 30px; font-size:15px; cursor:pointer; backdrop-filter:blur(10px); transition:all .3s ease; }
        .ghost-cta:hover { background:rgba(255,255,255,0.1); border-color:rgba(63,208,255,0.4); transform:translateY(-3px); }
        .foot-link { color:rgba(255,255,255,0.55); text-decoration:none; font-size:14px; cursor:pointer; background:none; border:none; display:block; padding:5px 0; transition:color .2s ease; text-align:left; }
        .foot-link:hover { color:${OCEAN.glow}; }
      `}</style>

      {/* Ambient liquid-glass background: layered ocean blobs, fixed behind all sections */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div className="animate-liquid-a" style={{ position: "absolute", top: "-10%", left: "-8%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(63,208,255,0.16), transparent 70%)", filter: "blur(10px)" }} />
        <div className="animate-liquid-b" style={{ position: "absolute", top: "30%", right: "-12%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(18,230,180,0.10), transparent 70%)", filter: "blur(10px)" }} />
        <div className="animate-liquid-a" style={{ position: "absolute", bottom: "-14%", left: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,31,64,0.55), transparent 70%)", filter: "blur(10px)" }} />
      </div>

      <PublicNavbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section id="home" style={{
        position: "relative", zIndex: 1, padding: "170px 24px 90px", textAlign: "center",
        backgroundImage: `linear-gradient(180deg, rgba(2,6,16,0.82) 0%, rgba(2,6,16,0.92) 55%, ${OCEAN.deep} 100%), url(${imgFloor})`,
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
        backgroundRepeat: "no-repeat",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glassPanel(), padding: "8px 18px", borderRadius: 999, marginBottom: 30, fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 0.3 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: OCEAN.glow2, boxShadow: `0 0 10px ${OCEAN.glow2}` }} />
            Manage · Optimize · Deliver
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 style={{
            fontSize: "clamp(30px,6vw,58px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1,
            textTransform: "uppercase", color: "#fff", margin: "0 0 20px",
            textShadow: `0 0 46px rgba(63,208,255,0.3)`,
          }}>
            Warehouse Management System
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 34 }}>
            {[
              { icon: "📡", label: "Real-Time Tracking" },
              { icon: "🤖", label: "AI Demand Forecasting" },
              { icon: "🔐", label: "Role-Based Access" },
              { icon: "🗺️", label: "Smart Layout Planning" },
            ].map(d => (
              <div key={d.label} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999, padding: "8px 16px", fontSize: 12.5, color: "rgba(255,255,255,0.65)", fontWeight: 600,
                backdropFilter: "blur(8px)",
              }}>
                <span>{d.icon}</span>{d.label}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <img src={logoFull} alt="Warehouse Management System" style={{ width: "min(260px, 55vw)", margin: "0 auto 26px", display: "block", filter: "drop-shadow(0 12px 30px rgba(63,208,255,0.22))" }} />
        </Reveal>

        <Reveal delay={180}>
          <h1 style={{ fontSize: "clamp(34px,6vw,62px)", fontWeight: 900, letterSpacing: -1.6, lineHeight: 1.08, margin: "0 0 20px" }}>
            One system for every<br />
            <span style={{ background: `linear-gradient(135deg, ${OCEAN.glow}, ${OCEAN.glow2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>shelf, rack &amp; box.</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.8, maxWidth: 620, margin: "0 auto 38px" }}>
            A single dashboard to track inventory, plan layouts, and forecast demand — built to cut wasted space and wasted hours.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="glow-cta" onClick={() => navigate("/register")}>Get Started</button>
            <button className="ghost-cta" onClick={() => navigate("/services")}>Explore Services</button>
          </div>
        </Reveal>

        {/* Floating hero glass panel */}
        <Reveal delay={420}>
          <div style={{ ...glassPanel(), marginTop: 64, padding: "34px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 20 }}>
            {STATS.map((s, i) => <StatBlock key={s.label} stat={s} i={i} />)}
          </div>
        </Reveal>
        </div>
      </section>

      {/* ── SHOWCASE (zigzag) ─────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "40px 24px 20px", display: "flex", flexDirection: "column", gap: 90 }}>
        <ShowcaseRow item={SHOWCASE[0]} index={0} />
        <ShowcaseRow item={SHOWCASE[1]} index={1} />
        <ShowcaseRow item={SHOWCASE[2]} index={0} />
        <ShowcaseRow item={SHOWCASE[3]} index={1} />
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────── */}
      <section id="services" style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "70px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: OCEAN.glow, fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Services</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: -1, marginBottom: 14 }}>Everything a warehouse needs</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15.5, maxWidth: 520, margin: "0 auto" }}>Six modules, one platform — engineered to reduce waste and increase visibility.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => <ServiceCard key={s.title} s={s} i={i} />)}
        </div>
        <Reveal delay={200}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="ghost-cta" onClick={() => navigate("/services")}>View All Services →</button>
          </div>
        </Reveal>
      </section>

      {/* ── ABOUT / TEAM ──────────────────────────────────────────────── */}
      <section id="about" style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "70px 24px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: OCEAN.glow2, fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>About</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: -1, marginBottom: 14 }}>The team behind the build</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15.5, maxWidth: 560, margin: "0 auto" }}>Five people, five roles, one warehouse system — from documentation to deployment.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((m, i) => <TeamCard key={m.name} m={m} i={i} />)}
        </div>
        <Reveal delay={200}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="ghost-cta" onClick={() => navigate("/about")}>More About Us →</button>
          </div>
        </Reveal>
      </section>

      {/* ── CAREERS / JOB OPENINGS ────────────────────────────────────── */}
      <section id="careers" style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "70px 24px" }}>
        <Reveal>
          <div style={{ ...glassPanel(), padding: "48px 36px", textAlign: "center" }}>
            <div style={{ color: OCEAN.glow, fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Careers</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, letterSpacing: -1, marginBottom: 14 }}>We're hiring — and interviewing now</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15.5, maxWidth: 560, margin: "0 auto 36px" }}>
              Submit an application and our team will reach out to schedule a job interview for open roles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ marginBottom: 34 }}>
              {OPENINGS.map((o, i) => (
                <Reveal key={o.title} delay={i * 100}>
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18,
                    padding: "22px 20px", textAlign: "left", transition: "all .35s ease", cursor: "pointer",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "rgba(63,208,255,0.4)"; el.style.transform = "translateY(-5px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.10)"; el.style.transform = "translateY(0)"; }}
                    onClick={() => navigate("/apply")}
                  >
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{o.icon}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{o.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>{o.dept} · {o.type}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="glow-cta" onClick={() => navigate("/apply")}>Apply Now</button>
              <button className="ghost-cta" onClick={() => navigate("/careers")}>See All Openings</button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 40 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 24px 32px" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: 32, marginBottom: 40 }}>
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <img src={logoFull} alt="WSOS" style={{ width: 130, marginBottom: 12, opacity: 0.95 }} />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>Manage · Optimize · Deliver — a complete warehouse operating system.</p>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: 0.3 }}>Product</div>
              <button className="foot-link" onClick={() => navigate("/services")}>Services</button>
              <button className="foot-link" onClick={() => navigate("/features")}>Features</button>
              <button className="foot-link" onClick={() => navigate("/process")}>Process</button>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: 0.3 }}>Company</div>
              <button className="foot-link" onClick={() => navigate("/about")}>About</button>
              <button className="foot-link" onClick={() => navigate("/careers")}>Careers</button>
              <button className="foot-link" onClick={() => navigate("/contact")}>Contact</button>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: 0.3 }}>Legal</div>
              <button className="foot-link" onClick={() => navigate("/faq")}>FAQ</button>
              <button className="foot-link" onClick={() => navigate("/terms")}>Terms &amp; Conditions</button>
              <button className="foot-link" onClick={() => navigate("/privacy")}>Privacy Policy</button>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: 0.3 }}>Account</div>
              <button className="foot-link" onClick={() => navigate("/login")}>Log In</button>
              <button className="foot-link" onClick={() => navigate("/register")}>Get Started</button>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5 }}>© 2026 Warehouse Management System. All rights reserved.</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5 }}>Built by Aafiya · Kayathri · Kanchana · Jora · Uwise</span>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <button className="foot-link" style={{ padding: 0, fontSize: 12.5 }} onClick={() => navigate("/faq")}>FAQ</button>
              <button className="foot-link" style={{ padding: 0, fontSize: 12.5 }} onClick={() => navigate("/terms")}>Terms &amp; Conditions</button>
              <button className="foot-link" style={{ padding: 0, fontSize: 12.5 }} onClick={() => navigate("/privacy")}>Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
