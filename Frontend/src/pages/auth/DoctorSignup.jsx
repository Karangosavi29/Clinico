import { useState } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../../api/authApi.js";

const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb", border: "#d4e9e9",
  error: "#c0392b", errorFaint: "#fff1f0",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

const SPECS = [
  { value: "", label: "— Select Specialization —" },
  { value: "Cardiologist", label: "🫀 Cardiologist" },
  { value: "Neurologist", label: "🧠 Neurologist" },
  { value: "Pediatrician", label: "👶 Pediatrician" },
  { value: "Orthopedist", label: "🦴 Orthopedist" },
  { value: "Dermatologist", label: "🩹 Dermatologist" },
  { value: "Psychiatrist", label: "🧘 Psychiatrist" },
  { value: "Gynecologist", label: "⚕ Gynecologist" },
  { value: "General Physician", label: "🩺 General Physician" },
  { value: "Other", label: "Other" },
];

function Field({ label, type = "text", value, onChange, placeholder, required, icon, error, hint }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: error ? C.error : C.textLight, marginBottom: "5px", textTransform: "uppercase", fontFamily: F.body }}>
        {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: focus ? C.teal : "#9bb8b8", pointerEvents: "none", transition: "color 0.2s" }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", padding: icon ? "11px 12px 11px 36px" : "11px 12px",
            border: `1.5px solid ${error ? C.error : focus ? C.teal : C.border}`,
            borderRadius: "10px", fontSize: "14px", fontFamily: F.body, color: C.text,
            background: focus ? C.white : C.tealFaint, outline: "none",
            boxShadow: focus ? "0 0 0 3px rgba(11,110,110,0.09)" : "none",
            transition: "all 0.2s", boxSizing: "border-box",
          }}
        />
      </div>
      {error && <p style={{ fontSize: "12px", color: C.error, marginTop: "3px" }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: "11px", color: C.textLight, marginTop: "3px" }}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required, error }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: error ? C.error : C.textLight, marginBottom: "5px", textTransform: "uppercase", fontFamily: F.body }}>
        {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
      </label>
      <select value={value} onChange={onChange} style={{
        width: "100%", padding: "11px 12px",
        border: `1.5px solid ${error ? C.error : C.border}`, borderRadius: "10px",
        fontSize: "14px", fontFamily: F.body, color: value ? C.text : "#9bb8b8",
        background: C.tealFaint, outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ fontSize: "12px", color: C.error, marginTop: "3px" }}>{error}</p>}
    </div>
  );
}

const DoctorSignup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    licenseNumber: "", specialization: "", clinicName: "", experience: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const v1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Full name required";
    if (!form.email || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const v2 = () => {
    const e = {};
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number required";
    if (!form.specialization) e.specialization = "Select a specialization";
    if (!form.clinicName.trim()) e.clinicName = "Clinic/Hospital name required";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!v2()) return;
    setLoading(true); setServerError("");
    try {
      // Register user as doctor — license/clinic/spec stored via doctor profile endpoint after approval
      await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "doctor",
      });
      setDone(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

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
          flex: "0 0 38%",
          background: `linear-gradient(160deg, #041e1e 0%, ${C.tealDeep} 52%, #0a5252 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: "60px 44px",
          position: "relative", overflow: "hidden",
        }}>
          {[[280, { top: "-60px", left: "-60px" }], [160, { bottom: "30px", right: "-40px" }]].map(([s, pos], i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", ...pos }} />
          ))}

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "44px", textDecoration: "none" }}>
            <div style={{ width: "38px", height: "38px", background: "rgba(255,255,255,0.13)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.22)" }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: "22px", height: "22px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: F.display, fontSize: "21px", fontWeight: "700", color: C.white }}>MediCare</span>
          </Link>

          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "38px", marginBottom: "26px", animation: "floatY 4s ease-in-out infinite" }}>🩺</div>

          <h2 style={{ fontFamily: F.display, fontSize: "28px", fontWeight: "700", color: C.white, textAlign: "center", lineHeight: "1.2", marginBottom: "14px" }}>
            Join as a<br /><span style={{ fontStyle: "italic", color: "#7ee8e8" }}>Doctor</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textAlign: "center", lineHeight: "1.8", maxWidth: "230px", marginBottom: "26px" }}>
            Expand your practice and reach more patients through MediCare's verified network.
          </p>

          {["📊 Doctor dashboard & analytics", "👥 Access to 2,400+ patients", "📅 Smart scheduling system", "⭐ Build your review profile"].map(p => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "9px", padding: "8px 11px", fontSize: "12px", color: "rgba(255,255,255,0.65)", width: "100%", maxWidth: "230px", marginBottom: "7px" }}>{p}</div>
          ))}

          <div style={{ marginTop: "16px", background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.24)", borderRadius: "10px", padding: "10px 13px", maxWidth: "230px", width: "100%" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#f5c842", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>⏳ Pending Approval</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: "1.6" }}>Admin verifies all doctors within 24–48 hours.</div>
          </div>
        </div>

        {/* ── Right Form ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: C.offwhite, overflowY: "auto" }}>
          <div style={{
            background: C.white, borderRadius: "22px",
            boxShadow: "0 8px 48px rgba(11,110,110,0.10)",
            padding: "44px 40px", width: "100%", maxWidth: "480px",
            animation: "fadeIn 0.4s ease",
          }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "16px 0", animation: "slideUp 0.4s ease" }}>
                <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "linear-gradient(135deg, #f5c842, #e8a428)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: "28px" }}>⏳</div>
                <h2 style={{ fontFamily: F.display, fontSize: "25px", color: C.text, marginBottom: "10px" }}>Application Submitted!</h2>
                <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", maxWidth: "300px", margin: "0 auto 10px" }}>
                  Welcome, <strong style={{ color: C.teal }}>Dr. {form.name}</strong>!
                </p>
                <p style={{ fontSize: "14px", color: C.textLight, lineHeight: "1.75", maxWidth: "300px", margin: "0 auto 22px" }}>
                  Your registration is <strong style={{ color: "#e08b2a" }}>pending admin approval</strong>. We'll notify you within 24–48 hours.
                </p>
                <div style={{ background: "#fffbf0", border: "1px solid #f5d98c", borderRadius: "11px", padding: "11px 14px", maxWidth: "285px", margin: "0 auto 24px", fontSize: "12px", color: "#7a5a10", lineHeight: "1.7" }}>
                  📧 Also verify your email via the link sent to your inbox.
                </div>
                <Link to="/login" style={{ display: "inline-block", background: C.teal, color: C.white, borderRadius: "11px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", textDecoration: "none", boxShadow: "0 4px 18px rgba(11,110,110,0.28)" }}>
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#fff8e8", border: "1px solid #f5d98c", borderRadius: "999px", padding: "4px 12px 4px 6px", fontSize: "12px", color: "#7a5a10", marginBottom: "16px" }}>
                  <span style={{ background: "#e8a428", color: C.white, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>Doctor</span>
                  Pending approval after submission
                </div>

                <h2 style={{ fontFamily: F.display, fontSize: "26px", color: C.text, marginBottom: "4px" }}>Doctor Registration</h2>
                <p style={{ fontSize: "13px", color: C.textLight, marginBottom: "22px" }}>Join MediCare's verified doctor network.</p>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
                  <StepDot n={1} active={step >= 1} done={step > 1} />
                  <span style={{ fontSize: "12px", color: step >= 1 ? C.teal : C.textLight, fontWeight: "600" }}>Account</span>
                  <div style={{ flex: 1, height: "2px", background: step > 1 ? C.teal : C.border, transition: "background 0.3s" }} />
                  <StepDot n={2} active={step >= 2} done={false} />
                  <span style={{ fontSize: "12px", color: step >= 2 ? C.teal : C.textLight, fontWeight: "600" }}>Professional Info</span>
                </div>

                {serverError && (
                  <div style={{ padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: C.errorFaint, border: "1px solid #f5b8b8", color: C.error, fontSize: "13px", display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: "800" }}>⚠</span><span>{serverError}</span>
                  </div>
                )}

                {step === 1 && (
                  <form onSubmit={e => { e.preventDefault(); if (v1()) setStep(2); }} noValidate style={{ animation: "slideUp 0.25s ease" }}>
                    <Field label="Full Name (with title)" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Dr. Rohit Sharma" required icon="👤" error={errors.name} />
                    <Field label="Email Address" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="doctor@hospital.com" required icon="✉" error={errors.email} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 chars" required icon="🔒" error={errors.password} />
                      <Field label="Confirm" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat" required icon="🔒" error={errors.confirm} />
                    </div>
                    <NextBtn label="Continue → Professional Info" />
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} noValidate style={{ animation: "slideUp 0.25s ease" }}>
                    <Field label="Medical License Number" value={form.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} placeholder="e.g. MCI-2024-XXXXX" required icon="📋" error={errors.licenseNumber} hint="Your official Medical Council registration number" />
                    <SelectField label="Specialization" value={form.specialization} onChange={e => set("specialization", e.target.value)} options={SPECS} required error={errors.specialization} />
                    <Field label="Clinic / Hospital Name" value={form.clinicName} onChange={e => set("clinicName", e.target.value)} placeholder="Apollo Hospital, Mumbai" required icon="🏥" error={errors.clinicName} />
                    <Field label="Years of Experience (optional)" type="number" value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 8" icon="📅" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <button type="button" onClick={() => setStep(1)} style={{ padding: "13px", background: C.white, color: C.textLight, border: `1.5px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>← Back</button>
                      <SubmitBtn loading={loading} label="Submit Application" />
                    </div>
                  </form>
                )}

                <div style={{ height: "1px", background: C.border, margin: "20px 0" }} />
                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight }}>
                  Already registered?{" "}
                  <Link to="/login" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
                </p>
                <p style={{ textAlign: "center", fontSize: "13px", color: C.textLight, marginTop: "8px" }}>
                  Registering as patient?{" "}
                  <Link to="/signup" style={{ color: C.teal, fontWeight: "700", textDecoration: "none" }}>Patient signup →</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function StepDot({ n, active, done }) {
  return (
    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: active ? C.teal : C.border, color: active ? C.white : C.textLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", transition: "all 0.3s", flexShrink: 0 }}>
      {done ? "✓" : n}
    </div>
  );
}

function NextBtn({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="submit" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", padding: "13px", background: hov ? C.tealDark : C.teal, color: C.white, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", fontFamily: F.body, cursor: "pointer", transition: "all 0.2s", boxShadow: hov ? "0 6px 22px rgba(11,110,110,0.35)" : "0 2px 8px rgba(11,110,110,0.18)" }}>
      {label}
    </button>
  );
}

function SubmitBtn({ loading, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="submit" disabled={loading} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", padding: "13px", background: loading ? "#6aadad" : hov ? C.tealDark : C.teal, color: C.white, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", fontFamily: F.body, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: hov && !loading ? "0 6px 22px rgba(11,110,110,0.35)" : "0 2px 8px rgba(11,110,110,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
      {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: C.white, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
      {loading ? "Please wait…" : label}
    </button>
  );
}

export default DoctorSignup;