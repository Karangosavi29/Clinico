import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/authApi.js";

const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb", border: "#d4e9e9",
  error: "#c0392b", errorFaint: "#fff1f0",
  success: "#1a7a52", successFaint: "#f0faf5",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

function Field({ label, type = "text", value, onChange, placeholder, icon, error }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
        color: error ? C.error : C.textLight, marginBottom: "6px",
        textTransform: "uppercase", fontFamily: F.body,
      }}>
        {label} <span style={{ color: C.error }}>*</span>
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
          placeholder={placeholder} required
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(token ? null : "no-token"); // null | "success" | "error" | "no-token"
  const [message, setMessage] = useState("");

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  // Password strength
  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const sCols = ["#e05c5c", "#e08b2a", "#e8c12a", "#5ab85a", C.teal];
  const sLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];

  const validate = () => {
    const e = {};
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters required";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setStatus(null);
    try {
      await resetPassword(token, form.password);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Reset failed. The link may have expired.");
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
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[[280, { top: "-80px", left: "-70px" }], [180, { bottom: "-50px", right: "-40px" }]].map(([s, pos], i) => (
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

          {/* No token */}
          {status === "no-token" && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c0392b, #e05c5c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", fontSize: "30px", color: C.white,
              }}>✕</div>
              <h2 style={{ fontFamily: F.display, fontSize: "24px", color: C.text, marginBottom: "10px" }}>
                Invalid Reset Link
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", marginBottom: "28px" }}>
                No reset token found. Please request a new password reset link.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Link to="/forgot-password" style={{
                  display: "inline-block", background: C.teal, color: C.white,
                  borderRadius: "11px", padding: "12px 24px", fontSize: "14px", fontWeight: "700",
                  textDecoration: "none", boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
                }}>Request New Link</Link>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
              <div style={{
                width: "76px", height: "76px", borderRadius: "50%",
                background: "linear-gradient(135deg, #1a7a52, #2aaa72)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", fontSize: "30px", color: C.white,
                animation: "floatY 3s ease-in-out infinite",
              }}>✓</div>
              <h2 style={{ fontFamily: F.display, fontSize: "25px", color: C.text, marginBottom: "10px" }}>
                Password Reset!
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", marginBottom: "28px" }}>
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <Link to="/login" style={{
                display: "inline-block", background: C.teal, color: C.white,
                borderRadius: "11px", padding: "13px 32px", fontSize: "14px", fontWeight: "700",
                textDecoration: "none", boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
              }}>Sign In Now →</Link>
            </div>
          )}

          {/* Form */}
          {(status === null || status === "error") && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: C.tealFaint, border: `1.5px solid ${C.tealMid}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 22px", fontSize: "26px",
              }}>🔒</div>

              <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, textAlign: "center", marginBottom: "6px" }}>
                Set New Password
              </h2>
              <p style={{ fontSize: "14px", color: C.textLight, textAlign: "center", marginBottom: "28px", lineHeight: "1.7" }}>
                Choose a strong password for your MediCare account.
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

              <form onSubmit={handleSubmit} noValidate>
                <Field label="New Password" type="password" value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="Min. 6 characters" icon="🔒" error={errors.password} />
                <Field label="Confirm Password" type="password" value={form.confirm}
                  onChange={e => set("confirm", e.target.value)}
                  placeholder="Repeat password" icon="🔒" error={errors.confirm} />

                {/* Strength meter */}
                {form.password && (
                  <div style={{ marginTop: "-6px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: "3px", borderRadius: "3px", background: i <= strength ? sCols[strength - 1] : C.border, transition: "background 0.2s" }} />
                      ))}
                    </div>
                    {strength > 0 && <span style={{ fontSize: "11px", color: sCols[strength - 1], fontWeight: "600" }}>{sLabels[strength]}</span>}
                  </div>
                )}

                <SubmitBtn loading={loading} label="Reset Password" />
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
      {loading ? "Resetting…" : label}
    </button>
  );
}

export default ResetPassword;
