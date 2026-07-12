import { Link } from "react-router-dom";

const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textLight: "#6a9090",
  white: "#ffffff", border: "#d4e9e9",
  success: "#1a7a52",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

const EmailVerified = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(26,122,82,0.25)}50%{box-shadow:0 0 0 14px rgba(26,122,82,0)}}
    `}</style>

    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(150deg, ${C.tealDeep} 0%, ${C.tealDark} 55%, #0d5c5c 100%)`,
      fontFamily: F.body, padding: "24px",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[[300, { top: "-90px", right: "-70px" }], [160, { bottom: "-40px", left: "-40px" }]].map(([s, pos], i) => (
          <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", ...pos }} />
        ))}
      </div>

      <div style={{
        background: C.white, borderRadius: "24px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.08)",
        padding: "56px 44px", width: "100%", maxWidth: "420px",
        animation: "fadeUp 0.5s ease", position: "relative", zIndex: 1,
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", marginBottom: "36px" }}>
          <div style={{ width: "36px", height: "36px", background: C.teal, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: "20px", height: "20px" }}>
              <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
              <rect x="3" y="10" width="18" height="4" rx="2" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: F.display, fontSize: "21px", fontWeight: "700", color: C.teal }}>MediCare</span>
        </div>

        {/* Success icon */}
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "linear-gradient(135deg, #1a7a52, #2aaa72)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: "34px", color: C.white,
          animation: "floatY 3s ease-in-out infinite, pulse 2.5s ease infinite",
        }}>✓</div>

        <h2 style={{
          fontFamily: F.display, fontSize: "26px", fontWeight: "700",
          color: C.text, marginBottom: "10px",
        }}>
          Email Verified!
        </h2>

        <p style={{
          fontSize: "14px", color: C.textLight, lineHeight: "1.75",
          maxWidth: "300px", margin: "0 auto 12px",
        }}>
          Your account has been successfully verified and is now active.
        </p>

        <div style={{
          background: C.tealFaint, border: `1px solid ${C.tealMid}`,
          borderRadius: "12px", padding: "14px 16px", marginBottom: "32px",
          fontSize: "13px", color: C.textLight, lineHeight: "1.7",
        }}>
          🎉 You're all set! Sign in to book appointments and access your healthcare dashboard.
        </div>

        <Link to="/login" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
          background: C.teal, color: C.white, borderRadius: "12px",
          padding: "13px 32px", fontSize: "14px", fontWeight: "700",
          textDecoration: "none", boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
          transition: "all 0.2s", fontFamily: F.body,
        }}>
          Sign In Now →
        </Link>

        <p style={{ fontSize: "12px", color: C.textLight, marginTop: "20px" }}>
          Need help?{" "}
          <Link to="/" style={{ color: C.teal, fontWeight: "600", textDecoration: "none" }}>Return to Home</Link>
        </p>
      </div>
    </div>
  </>
);

export default EmailVerified;