import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail } from "../../api/authApi"; // ← correct name

const C = {
  teal: "#0B6E6E", tealLight: "#14a8a8", tealDeep: "#063d3d",
  text: "#1a2e2e", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb",
  error: "#c0392b", errorFaint: "#fff1f0",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token); // ← correct function name from authApi.js
        setStatus("success");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "Verification failed. The link may have expired."
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(150deg, ${C.tealDeep} 0%, #085252 60%, #0d5c5c 100%)`,
        fontFamily: F.body, padding: "24px",
      }}>
        <div style={{
          background: C.white, borderRadius: "22px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          padding: "52px 44px", width: "100%", maxWidth: "420px",
          textAlign: "center", animation: "fadeUp 0.4s ease",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", marginBottom: "36px" }}>
            <div style={{ width: "34px", height: "34px", background: C.teal, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: "20px", height: "20px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: F.display, fontSize: "20px", fontWeight: "700", color: C.teal }}>MediCare</span>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                border: `3px solid ${C.tealLight}`, borderTopColor: "transparent",
                margin: "0 auto 24px", animation: "spin 0.8s linear infinite",
              }} />
              <h2 style={{ fontFamily: F.display, fontSize: "24px", color: C.text, marginBottom: "10px" }}>
                Verifying your email…
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.7" }}>
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #1a7a52, #2aaa72)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", fontSize: "30px",
              }}>✓</div>
              <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, marginBottom: "10px" }}>
                Email Verified!
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", marginBottom: "28px" }}>
                Your account is now active. Redirecting you to sign in…
              </p>
              <Link to="/login" style={{
                display: "inline-block", background: C.teal, color: C.white,
                borderRadius: "11px", padding: "12px 28px",
                fontSize: "14px", fontWeight: "700", textDecoration: "none",
                boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
              }}>Go to Sign In →</Link>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c0392b, #e05c5c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", fontSize: "30px", color: C.white,
              }}>✕</div>
              <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, marginBottom: "10px" }}>
                Verification Failed
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", marginBottom: "28px" }}>
                {message}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link to="/signup" style={{
                  display: "inline-block", background: C.white, color: C.teal,
                  border: `1.5px solid ${C.teal}`, borderRadius: "11px",
                  padding: "11px 22px", fontSize: "14px", fontWeight: "700", textDecoration: "none",
                }}>Re-register</Link>
                <Link to="/login" style={{
                  display: "inline-block", background: C.teal, color: C.white,
                  borderRadius: "11px", padding: "11px 22px",
                  fontSize: "14px", fontWeight: "700", textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
                }}>Sign In</Link>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default VerifyEmail;