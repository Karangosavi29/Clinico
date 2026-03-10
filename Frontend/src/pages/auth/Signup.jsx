import { useState } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../../api/authApi.js";

const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textLight: "#6a9090",
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
      {error && <p style={{ fontSize: "12px", color: C.error, marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

/* ── Signup (Patient) ─────────────────────────────────────────────────────── */
const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Full name required (min. 2 chars)";
    if (!form.email || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setAlert(null);
    try {
      await signupUser({ name: form.name, email: form.email, password: form.password, role: "patient" });
      setDone(true);
    } catch (err) {
      setAlert(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  /* password strength */
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: F.body }}>

        {/* ── Left Panel ── */}
        <div style={{
          flex: "0 0 40%",
          background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.tealDark} 58%, #0d5c5c 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: "60px 44px",
          position: "relative", overflow: "hidden",
        }}>
          {[[300, { top: "-80px", right: "-80px" }], [170, { bottom: "40px", left: "-50px" }]].map(([s, pos], i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", ...pos }} />
          ))}

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px", textDecoration: "none" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.14)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.24)" }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: "24px", height: "24px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: F.display, fontSize: "22px", fontWeight: "700", color: C.white }}>MediCare</span>
          </Link>

          {/* Perks card */}
          <div style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "18px", padding: "22px", width: "100%", maxWidth: "270px",
            marginBottom: "30px", animation: "floatY 4s ease-in-out infinite",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "14px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🧑</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: C.white }}>Patient Account</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>Free forever</div>
              </div>
            </div>
            {["✓ Book appointments online", "✓ View doctor profiles", "✓ Manage health records", "✓ Email reminders"].map(p => (
              <div key={p} style={{ fontSize: "12px", color: "rgba(255,255,255,0.68)", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>{p}</div>
            ))}
          </div>

          <h2 style={{ fontFamily: F.display, fontSize: "28px", fontWeight: "700", color: C.white, textAlign: "center", lineHeight: "1.2", marginBottom: "12px" }}>
            Start your health<br />
            <span style={{ fontStyle: "italic", color: "#7ee8e8" }}>journey today.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.48)", fontSize: "13px", textAlign: "center", lineHeight: "1.8", maxWidth: "240px" }}>
            Join thousands of patients already managing their health on MediCare.
          </p>
        </div>

        {/* ── Right Form ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: C.offwhite, overflowY: "auto" }}>
          <div style={{
            background: C.white, borderRadius: "22px",
            boxShadow: "0 8px 48px rgba(11,110,110,0.10)",
            padding: "44px 40px", width: "100%", maxWidth: "460px",
            animation: "fadeIn 0.4s ease",
          }}>
            {done ? (
              /* ── Success ── */
              <div style={{ textAlign: "center", padding: "16px 0", animation: "slideUp 0.4s ease" }}>
                <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: "28px" }}>✉</div>
                <h2 style={{ fontFamily: F.display, fontSize: "25px", color: C.text, marginBottom: "12px" }}>Check your email!</h2>
                <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", maxWidth: "280px", margin: "0 auto 28px" }}>
                  A verification link was sent to <strong style={{ color: C.teal }}>{form.email}</strong>. Click it to activate your account.
                </p>
                <Link to="/login" style={{
                  display: "inline-block", background: C.teal, color: C.white,
                  borderRadius: "11px", padding: "12px 28px", fontSize: "14px",
                  fontWeight: "700", textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(11,110,110,0.28)",
                }}>Go to Sign In</Link>
              </div>
            ) : (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                {/* Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  background: C.tealFaint, border: `1px solid ${C.tealMid}`,
                  borderRadius: "999px", padding: "4px 12px 4px 6px",
                  fontSize: "12px", color: C.teal, marginBottom: "16px",
                }}>
                  <span style={{ background: C.teal, color: C.white, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>Patient</span>
                  Free registration
                </div>

                <h2 style={{ fontFamily: F.display, fontSize: "27px", color: C.text, marginBottom: "4px" }}>Create your account</h2>
                <p style={{ fontSize: "13px", color: C.textLight, marginBottom: "24px" }}>Join MediCare and take control of your healthcare.</p>

                {alert && (
                  <div style={{ padding: "11px 14px", borderRadius: "10px", marginBottom: "18px", background: C.errorFaint, border: "1px solid #f5b8b8", color: C.error, fontSize: "13px", display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: "800" }}>⚠</span><span>{alert}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <Field label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Aarav Patel" required icon="👤" error={errors.name} />
                  <Field label="Email Address" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" required icon="✉" error={errors.email} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <Field label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 chars" required icon="🔒" error={errors.password} />
                    <Field label="Confirm" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat" required icon="🔒" error={errors.confirm} />
                  </div>

                  {/* Strength meter */}
                  {form.password && (
                    <div style={{ marginTop: "-6px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "3px", background: i <= strength ? sCols[strength - 1] : C.border, transition: "background 0.2s" }} />
                        ))}
                      </div>
                      {strength > 0 && <span style={{ fontSize: "11px", color: sCols[strength - 1], fontWeight: "600" }}>{sLabels[strength]}</span>}
                    </div>
                  )}

                  <SubmitBtn loading={loading} label="Create Patient Account" />
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: C.border }} />
                  <span style={{ fontSize: "12px", color: C.textLight }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: C.border }} />
                </div>

                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
                </p>
                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight, marginTop: "10px" }}>
                  Are you a doctor?{" "}
                  <Link to="/doctor-signup" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Register as Doctor →</Link>
                </p>
              </div>
            )}
          </div>
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
      {loading ? "Please wait…" : label}
    </button>
  );
}

export default Signup;