import PublicNavbar from "../components/PublicNavbar";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly — such as your name, email, phone number, and department when you register — along with data generated as you use the Service, like inventory records, stock movements, and login activity.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use this information to operate the Service, authenticate your account, apply the correct role-based permissions, generate reports and forecasts, and communicate important updates about your account.",
  },
  {
    title: "3. Data Storage & Security",
    body: "Data is stored on secured servers with access restricted by authentication and role-based permissions. We use industry-standard practices to protect information against unauthorized access, alteration, or loss.",
  },
  {
    title: "4. Cookies & Local Storage",
    body: "The Service may use cookies or browser storage to keep you signed in and remember preferences such as light or dark mode. These are not used for advertising.",
  },
  {
    title: "5. Sharing of Information",
    body: "We do not sell your personal information. Data may be shared with service providers who help us operate the platform (such as hosting), and only to the extent needed to provide the Service.",
  },
  {
    title: "6. Job Applications",
    body: "If you submit a job application through the Careers or Apply pages, the details you provide are used solely to evaluate your application and contact you about the role.",
  },
  {
    title: "7. Your Rights",
    body: "You can review, update, or request deletion of your personal information by contacting us. Account holders can update most profile details directly within the Service.",
  },
  {
    title: "8. Data Retention",
    body: "We retain account and operational data for as long as your account is active, or as needed to comply with legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy periodically. Material changes will be reflected by an updated date at the top of this page.",
  },
  {
    title: "10. Contact",
    body: "For questions about this Privacy Policy or how your data is handled, please reach out through the Contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "148px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, marginBottom: 14, letterSpacing: -1.5, background: "linear-gradient(135deg,#3FD0FF,#12E6B4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 44 }}>Last updated: July 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 style={{ color: "#3FD0FF", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
