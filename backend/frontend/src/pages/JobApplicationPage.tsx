import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function JobApplicationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("job") || "Warehouse Position";
  const jobDept = searchParams.get("dept") || "";
  const jobLocation = searchParams.get("location") || "";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience_years: "",
    current_location: "",
    notice_period: "",
    expected_salary: "",
    cover_letter: "",
    resume_link: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      setError("Please fill in Name, Email and Phone.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/applications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, job_title: jobTitle, department: jobDept, location: jobLocation }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Please try again later.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 11,
    padding: "13px 16px",
    fontSize: 14,
    width: "100%",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "all 0.3s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 7,
  };

  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1) !important;
          background: rgba(0,212,255,0.03) !important;
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
        select option { background: #0a1628; color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Back */}
        <button onClick={() => navigate("/careers")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 10, padding: "8px 18px", cursor: "pointer", marginBottom: 40, fontSize: 14 }}>← Back to Jobs</button>

        {submitted ? (
          /* ── Success Screen ── */
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 72, marginBottom: 24 }}>✅</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: "#fff" }}>Application Submitted!</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.8, marginBottom: 8 }}>
              Thank you <strong style={{ color: "#00d4ff" }}>{form.full_name}</strong>!
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
              Your application for <strong style={{ color: "#fff" }}>{jobTitle}</strong> has been received. Our team will contact you at <strong style={{ color: "#00d4ff" }}>{form.email}</strong> within 3 business days.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/careers")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                View More Jobs
              </button>
              <button onClick={() => navigate("/")} style={{ background: "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", color: "#000", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Job Info Banner ── */}
            <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 16, padding: "20px 24px", marginBottom: 36, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 36 }}>📦</div>
              <div>
                <div style={{ color: "#00d4ff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Applying For</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{jobTitle}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 3 }}>
                  {jobDept && `${jobDept}`}{jobLocation && ` · 📍 ${jobLocation}`}
                </div>
              </div>
            </div>

            {/* ── Form Header ── */}
            <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, marginBottom: 8, letterSpacing: -1, background: "linear-gradient(135deg,#fff 60%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Application
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
              Fill in your details below. Fields marked <span style={{ color: "#dc2626" }}>*</span> are required.
            </p>

            {/* ── Form ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input style={inputStyle} placeholder="e.g. Ravi Kumar" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address <span style={{ color: "#dc2626" }}>*</span></label>
                  <input style={inputStyle} type="email" placeholder="ravi@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Phone Number <span style={{ color: "#dc2626" }}>*</span></label>
                  <input style={inputStyle} placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Current Location</label>
                  <input style={inputStyle} placeholder="e.g. Chennai, Tamil Nadu" value={form.current_location} onChange={e => update("current_location", e.target.value)} />
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Years of Experience</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.experience_years} onChange={e => update("experience_years", e.target.value)}>
                    <option value="">Select experience</option>
                    <option>Fresher (0 yrs)</option>
                    <option>1–2 years</option>
                    <option>3–5 years</option>
                    <option>5–10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Notice Period</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.notice_period} onChange={e => update("notice_period", e.target.value)}>
                    <option value="">Select notice period</option>
                    <option>Immediate</option>
                    <option>15 days</option>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Expected Salary (per month)</label>
                  <input style={inputStyle} placeholder="e.g. ₹25,000" value={form.expected_salary} onChange={e => update("expected_salary", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Resume / LinkedIn Link</label>
                  <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.resume_link} onChange={e => update("resume_link", e.target.value)} />
                </div>
              </div>

              {/* Cover letter */}
              <div>
                <label style={labelStyle}>Why do you want this job?</label>
                <textarea style={{ ...inputStyle, resize: "none" }} rows={5} placeholder="Tell us about your warehouse experience, skills, and why you're a great fit for this role..." value={form.cover_letter} onChange={e => update("cover_letter", e.target.value)} />
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 14 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ background: loading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg,#00d4ff,#0ea5e9)", border: "none", borderRadius: 12, color: "#000", fontWeight: 800, padding: "16px", cursor: loading ? "not-allowed" : "pointer", fontSize: 15, transition: "all 0.3s", marginTop: 8 }}>
                {loading ? "Submitting..." : "Submit Application →"}
              </button>

              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                Your data is safe with us. We'll only use it for hiring purposes.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}