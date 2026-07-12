import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi.js";

const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb", border: "#d4e9e9",
  error: "#c0392b", errorFaint: "#fff1f0",
  success: "#1a7a52", successFaint: "#f0faf5",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [message, setMessage] = useState("");
  const [focus, setFocus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await forgotPassword(email);
      setStatus("success");
      setMessage("Password reset link sent! Check your inbox.");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(150deg, ${C.tealDeep} 0%, ${C.tealDark} 55%, #0d5c5c 100%)`,
        fontFamily: F.body, padding: "24px",
      }}>
        {/* Decorative bg circles */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[[320, { top: "-100px", right: "-80px" }], [200, { bottom: "-60px", left: "-50px" }], [120, { top: "35%", left: "8%" }]].map(([s, pos], i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", ...pos }} />
          ))}
        </div>

        <div style={{
          background: C.white, borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.08)",
          padding: "52px 44px", width: "100%", maxWidth: "440px",
          animation: "fadeUp 0.5s ease", position: "relative", zIndex: 1,
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

          {status === "success" ? (
            /* Success state */
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
              <div style={{
                width: "76px", height: "76px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", fontSize: "32px",
                animation: "floatY 3s ease-in-out infinite",
              }}>✉</div>
              <h2 style={{ fontFamily: F.display, fontSize: "25px", color: C.text, marginBottom: "12px" }}>
                Check your inbox!
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", maxWidth: "300px", margin: "0 auto 8px" }}>
                We've sent a password reset link to:
              </p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: C.teal, marginBottom: "24px" }}>
                {email}
              </p>
              <div style={{
                background: C.tealFaint, border: `1px solid ${C.tealMid}`, borderRadius: "12px",
                padding: "14px 16px", marginBottom: "28px", fontSize: "13px", color: C.textLight, lineHeight: "1.7",
              }}>
                💡 The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => { setStatus(null); setEmail(""); }}
                  style={{
                    padding: "12px 22px", background: C.white, color: C.teal,
                    border: `1.5px solid ${C.teal}`, borderRadius: "11px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: F.body,
                  }}>Try Another Email</button>
                <Link to="/login" style={{
                  display: "inline-flex", alignItems: "center", padding: "12px 22px",
                  background: C.teal, color: C.white, borderRadius: "11px",
                  fontSize: "14px", fontWeight: "700", textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
                }}>Go to Sign In</Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: C.tealFaint, border: `1.5px solid ${C.tealMid}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 22px", fontSize: "26px",
              }}>🔑</div>

              <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, textAlign: "center", marginBottom: "6px" }}>
                Forgot Password?
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, textAlign: "center", marginBottom: "28px", lineHeight: "1.7" }}>
                No worries — enter your email and we'll send you a reset link.
              </p>

              {status === "error" && (
                <div style={{
                  padding: "11px 14px", borderRadius: "10px", marginBottom: "18px",
                  background: C.errorFaint, border: "1px solid #f5b8b8", color: C.error,
                  fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span style={{ fontWeight: "800" }}>⚠</span><span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                    color: C.textLight, marginBottom: "6px", textTransform: "uppercase", fontFamily: F.body,
                  }}>
                    Email Address <span style={{ color: C.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                      fontSize: "15px", color: focus ? C.teal : "#9bb8b8", pointerEvents: "none", transition: "color 0.2s",
                    }}>✉</span>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                      style={{
                        width: "100%", padding: "13px 14px 13px 38px",
                        border: `1.5px solid ${focus ? C.teal : C.border}`,
                        borderRadius: "10px", fontSize: "14px", fontFamily: F.body,
                        color: C.text, background: focus ? C.white : C.tealFaint,
                        outline: "none",
                        boxShadow: focus ? "0 0 0 3px rgba(11,110,110,0.09)" : "none",
                        transition: "all 0.2s", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <SubmitBtn loading={loading} label="Send Reset Link" />
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" }}>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
                <span style={{ fontSize: "12px", color: C.textLight }}>or</span>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
              </div>

              <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight }}>
                Remember your password?{" "}
                <Link to="/login" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
              </p>
              <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight, marginTop: "10px" }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Create account</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

function SubmitBtn({ loading, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "13px",
        background: loading ? "#6aadad" : hov ? C.tealDark : C.teal,
        color: C.white, border: "none", borderRadius: "12px",
        fontSize: "14px", fontWeight: "700", fontFamily: F.body,
        cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
        boxShadow: hov && !loading ? "0 6px 22px rgba(11,110,110,0.35)" : "0 2px 8px rgba(11,110,110,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
      {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: C.white, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
      {loading ? "Sending…" : label}
    </button>
  );
}

export default ForgotPassword;
