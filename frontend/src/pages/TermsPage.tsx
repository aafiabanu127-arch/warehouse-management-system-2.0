import PublicNavbar from "../components/PublicNavbar";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using the Warehouse Management System (\"the Service\"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not register for or use the Service.",
  },
  {
    title: "2. Who Can Use the Service",
    body: "The Service is intended for use by authorized personnel of an organization for managing warehouses, inventory, and related operations. You must provide accurate information when registering and keep your account credentials confidential.",
  },
  {
    title: "3. Accounts & Roles",
    body: "Each account is assigned a role (such as Admin, Manager, Supervisor, Staff, Picker, Auditor, or Viewer) that determines what actions and data you can access. You are responsible for all activity that occurs under your account.",
  },
  {
    title: "4. Acceptable Use",
    body: "You agree not to misuse the Service — including attempting unauthorized access to other accounts or data, disrupting the system's operation, or using it for any unlawful purpose.",
  },
  {
    title: "5. Data & Content",
    body: "Inventory records, stock movements, and other data you enter remain yours. We store and process this information solely to provide and improve the Service, in line with our Privacy Policy.",
  },
  {
    title: "6. Availability & Changes",
    body: "We aim to keep the Service available and reliable, but we do not guarantee uninterrupted access. Features may be added, changed, or removed as the system evolves.",
  },
  {
    title: "7. Limitation of Liability",
    body: "The Service is provided \"as is.\" To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service.",
  },
  {
    title: "8. Termination",
    body: "We may suspend or terminate access to an account that violates these Terms. You may stop using the Service and request account deletion at any time.",
  },
  {
    title: "9. Changes to These Terms",
    body: "We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.",
  },
  {
    title: "10. Contact",
    body: "Questions about these Terms can be sent to us through the Contact page.",
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#020810", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>
      <PublicNavbar />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "148px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, marginBottom: 14, letterSpacing: -1.5, background: "linear-gradient(135deg,#3FD0FF,#12E6B4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Terms &amp; Conditions
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
