import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

/* ── tiny style helpers ───────────────────────────────────────────────────── */
const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textMid: "#3d6060", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb", border: "#d4e9e9",
  error: "#c0392b", errorFaint: "#fff1f0",
  success: "#1a7a52", successFaint: "#f0faf5",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

function Field({ label, type = "text", value, onChange, placeholder, required, icon, error }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
        color: error ? C.error : C.textLight, marginBottom: "6px",
        textTransform: "uppercase", fontFamily: F.body,
      }}>
        {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "15px", color: focus ? C.teal : "#9bb8b8",
            pointerEvents: "none", transition: "color 0.2s",
          }}>{icon}</span>
        )}
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", padding: icon ? "12px 14px 12px 38px" : "12px 14px",
            border: `1.5px solid ${error ? C.error : focus ? C.teal : C.border}`,
            borderRadius: "10px", fontSize: "14px", fontFamily: F.body,
            color: C.text, background: focus ? C.white : C.tealFaint,
            outline: "none",
            boxShadow: focus ? "0 0 0 3px rgba(11,110,110,0.09)" : "none",
            transition: "all 0.2s", boxSizing: "border-box",
          }}
        />
      </div>
      {error && <p style={{ fontSize: "12px", color: C.error, marginTop: "4px", fontFamily: F.body }}>{error}</p>}
    </div>
  );
}

function AlertBox({ type, msg }) {
  if (!msg) return null;
  const s = type === "error"
    ? { bg: C.errorFaint, border: "#f5b8b8", color: C.error, icon: "⚠" }
    : { bg: C.successFaint, border: "#86d4ad", color: C.success, icon: "✓" };
  return (
    <div style={{
      padding: "11px 14px", borderRadius: "10px", marginBottom: "18px",
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: "13px", fontFamily: F.body,
      display: "flex", alignItems: "flex-start", gap: "8px",
    }}>
      <span style={{ fontWeight: "800" }}>{s.icon}</span><span>{msg}</span>
    </div>
  );
}

/* ── Login Page ───────────────────────────────────────────────────────────── */
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotAlert, setForgotAlert] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min. 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setAlert(null);
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      login(data); // saves to localStorage + context
      const map = { admin: "/admin", doctor: "/doctor", patient: "/patient" };
      navigate(map[data.user.role] || "/patient");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      if (msg.toLowerCase().includes("verify")) {
        setAlert({ type: "info", msg: "Please verify your email first. Check your inbox." });
      } else {
        setAlert({ type: "error", msg });
      }
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true); setForgotAlert(null);
    try {
      const { forgotPassword } = await import("../../api/authApi.js");
      await forgotPassword(forgotEmail);
      setForgotAlert({ type: "success", msg: "Reset link sent! Check your inbox." });
    } catch (err) {
      setForgotAlert({ type: "error", msg: err.response?.data?.message || "Failed. Try again." });
    } finally { setForgotLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: F.body }}>

        {/* ── Left Panel ── */}
        <div style={{
          flex: "0 0 42%",
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.tealDark} 55%, #0d5c5c 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: "60px 48px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative rings */}
          {[[260, { top: "-70px", left: "-70px" }], [160, { bottom: "50px", right: "-40px" }], [80, { top: "42%", right: "28px" }]].map(([s, pos], i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", ...pos }} />
          ))}

          {/* Logo */}
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "52px", textDecoration: "none",
          }}>
            <div style={{
              width: "40px", height: "40px", background: "rgba(255,255,255,0.14)",
              borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.24)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: "24px", height: "24px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: F.display, fontSize: "22px", fontWeight: "700", color: C.white }}>MediCare</span>
          </Link>

          {/* Floating card */}
          <div style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "20px", padding: "26px", width: "100%", maxWidth: "280px",
            backdropFilter: "blur(8px)", marginBottom: "32px",
            animation: "floatY 4s ease-in-out infinite",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: "700", color: C.white,
              }}>PS</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: C.white }}>Dr. Priya Sharma</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Cardiologist · ⭐ 4.9</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Next Appointment</div>
              <div style={{ fontSize: "13px", color: C.white, fontWeight: "600" }}>📅 March 14 · 10:30 AM</div>
              <div style={{ display: "inline-block", marginTop: "6px", background: "rgba(122,232,162,0.15)", color: "#7ee8a2", border: "1px solid rgba(122,232,162,0.3)", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700" }}>Confirmed</div>
            </div>
          </div>

          <h2 style={{
            fontFamily: F.display, fontSize: "30px", fontWeight: "700",
            color: C.white, textAlign: "center", lineHeight: "1.2", marginBottom: "14px",
          }}>
            Your health,<br />
            <span style={{ fontStyle: "italic", color: "#7ee8e8" }}>our priority.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textAlign: "center", lineHeight: "1.8", maxWidth: "260px" }}>
            Sign in to manage appointments, connect with doctors, and track your health journey.
          </p>

          {/* Pills */}
          <div style={{ marginTop: "28px", width: "100%", maxWidth: "260px" }}>
            {["📅 Book appointments instantly", "🩺 180+ verified specialists", "🔒 Secure & private"].map(p => (
              <div key={p} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "9px", padding: "9px 12px", fontSize: "12px",
                color: "rgba(255,255,255,0.68)", marginBottom: "7px",
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 24px", background: C.offwhite, overflowY: "auto",
        }}>
          <div style={{
            background: C.white, borderRadius: "22px",
            boxShadow: "0 8px 48px rgba(11,110,110,0.10), 0 2px 8px rgba(0,0,0,0.04)",
            padding: "44px 40px", width: "100%", maxWidth: "440px",
            animation: "fadeIn 0.4s ease",
          }}>

            {showForgot ? (
              /* ── Forgot Password ── */
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <button onClick={() => { setShowForgot(false); setForgotAlert(null); }}
                  style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: "13px", fontFamily: F.body, fontWeight: "600", padding: "0 0 20px 0", display: "flex", alignItems: "center", gap: "5px" }}>
                  ← Back to Sign In
                </button>
                <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, marginBottom: "6px" }}>Reset Password</h2>
                <p style={{ fontSize: "13px", color: C.textLight, marginBottom: "22px", lineHeight: "1.6" }}>
                  Enter your email and we'll send a reset link.
                </p>
                <AlertBox type={forgotAlert?.type} msg={forgotAlert?.msg} />
                <form onSubmit={handleForgot}>
                  <Field label="Email Address" type="email" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="you@example.com" required icon="✉" />
                  <Btn loading={forgotLoading} label="Send Reset Link" />
                </form>
              </div>
            ) : (
              /* ── Login Form ── */
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <h2 style={{ fontFamily: F.display, fontSize: "28px", color: C.text, marginBottom: "4px" }}>Welcome back</h2>
                <p style={{ fontSize: "13px", color: C.textLight, marginBottom: "28px" }}>Sign in to your MediCare account</p>

                <AlertBox type={alert?.type} msg={alert?.msg} />

                <form onSubmit={handleSubmit} noValidate>
                  <Field label="Email Address" type="email" value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com" required icon="✉" error={errors.email} />
                  <Field label="Password" type="password" value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="••••••••" required icon="🔒" error={errors.password} />

                  <div style={{ textAlign: "right", marginTop: "-6px", marginBottom: "22px" }}>
                    <Link to="/forgot-password"
                      style={{ color: C.teal, fontSize: "12px", fontWeight: "600", textDecoration: "underline" }}>
                      Forgot password?
                    </Link>
                  </div>
                  <Btn loading={loading} label="Sign In" />
                </form>

                <Divider />
                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight }}>
                  Don't have an account?{" "}
                  <Link to="/signup" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Create account</Link>
                </p>
                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight, marginTop: "10px" }}>
                  A doctor?{" "}
                  <Link to="/doctor-signup" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Join as Doctor →</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function Btn({ loading, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "13px", background: loading ? "#6aadad" : hov ? C.tealDark : C.teal,
        color: C.white, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700",
        fontFamily: F.body, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
        boxShadow: hov && !loading ? "0 6px 22px rgba(11,110,110,0.35)" : "0 2px 8px rgba(11,110,110,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
      {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: C.white, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
      {loading ? "Please wait…" : label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
      <div style={{ flex: 1, height: "1px", background: C.border }} />
      <span style={{ fontSize: "12px", color: C.textLight }}>or</span>
      <div style={{ flex: 1, height: "1px", background: C.border }} />
    </div>
  );
}

export default Login;