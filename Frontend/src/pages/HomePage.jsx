import { useState } from "react";
import { Link } from "react-router-dom";

/* ── Design Tokens ─────────────────────────────────────────────────────────── */
const C = {
  teal: "#0B6E6E", tealDark: "#085252", tealDeep: "#063d3d",
  tealLight: "#14a8a8", tealFaint: "#f0fafa", tealMid: "#d4eeee",
  text: "#1a2e2e", textMid: "#3d6060", textLight: "#6a9090",
  white: "#ffffff", offwhite: "#f7fbfb", border: "#d4e9e9",
};
const F = { display: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

/* ── Data ──────────────────────────────────────────────────────────────────── */
const DOCTORS = [
  { name: "Dr. Priya Sharma",  spec: "Cardiologist",    exp: "12 yrs", rating: 4.9, reviews: 184, av: "PS", col: "#0B6E6E" },
  { name: "Dr. Rahul Mehta",   spec: "Neurologist",     exp: "9 yrs",  rating: 4.8, reviews: 132, av: "RM", col: "#1a7a5a" },
  { name: "Dr. Anjali Verma",  spec: "Pediatrician",    exp: "15 yrs", rating: 5.0, reviews: 210, av: "AV", col: "#2a6090" },
  { name: "Dr. Vikram Patel",  spec: "Orthopedist",     exp: "11 yrs", rating: 4.7, reviews: 98,  av: "VP", col: "#6a3a8a" },
  { name: "Dr. Meena Rao",     spec: "Dermatologist",   exp: "8 yrs",  rating: 4.9, reviews: 156, av: "MR", col: "#8a4a2a" },
  { name: "Dr. Suresh Iyer",   spec: "Psychiatrist",    exp: "14 yrs", rating: 4.8, reviews: 87,  av: "SI", col: "#0a6a4a" },
];

const TESTIMONIALS = [
  { name: "Fatima K.",    role: "Patient", quote: "Booking has never been easier. The doctor was incredibly helpful and the entire process was seamless.", stars: 5, av: "FK" },
  { name: "Dr. Rohit D.", role: "Doctor",  quote: "MediCare helped me manage my practice better. The dashboard gives me everything I need to track my appointments.", stars: 5, av: "RD" },
  { name: "Sunita M.",    role: "Patient", quote: "Found the perfect specialist within minutes. The review system helped me choose the right doctor confidently.", stars: 5, av: "SM" },
];

const FEATURES = [
  { icon: "📅", title: "Easy Scheduling",   desc: "Book, reschedule, or cancel appointments in seconds — 24/7 availability at your fingertips.", bg: "#e8f6f6" },
  { icon: "🩺", title: "Verified Doctors",  desc: "Every doctor is licensed and verified. Browse specializations, experience, and real patient reviews.", bg: "#e8f0f8" },
  { icon: "🔒", title: "Secure Records",    desc: "Your health data is encrypted and private. Access your records anytime, anywhere securely.", bg: "#f0ebe8" },
  { icon: "📧", title: "Smart Reminders",   desc: "Automated email reminders so you never miss an appointment or a medication schedule.", bg: "#e8f6ee" },
];

const STEPS = [
  { n: "01", icon: "📝", title: "Create Account",    desc: "Register as a patient or doctor in under 2 minutes." },
  { n: "02", icon: "🔍", title: "Find a Doctor",     desc: "Browse verified specialists by specialty, rating, and availability." },
  { n: "03", icon: "📅", title: "Book Appointment",  desc: "Select a time slot that works for you and confirm instantly." },
  { n: "04", icon: "✅", title: "Get Your Care",     desc: "Attend your appointment and receive helpful follow-up reminders." },
];

/* ── Sub-components ────────────────────────────────────────────────────────── */
function Navbar() {
  const [hov, setHov] = useState(null);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${C.tealMid}`,
      padding: "0 5%", height: "62px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: F.body,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
        <div style={{ width: "34px", height: "34px", background: C.teal, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CrossIcon />
        </div>
        <span style={{ fontFamily: F.display, fontSize: "20px", fontWeight: "700", color: C.teal }}>MediCare</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "32px" }}>
        {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Doctors", "#doctors"]].map(([label, href]) => (
          <a key={label} href={href} style={{
            fontSize: "14px", fontWeight: "500",
            color: hov === label ? C.teal : C.textMid,
            textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={() => setHov(label)}
            onMouseLeave={() => setHov(null)}
          >{label}</a>
        ))}
      </div>

      {/* Auth buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <NavBtn to="/login"  label="Sign In"  primary={false} />
        <NavBtn to="/signup" label="Sign Up"  primary={true}  />
      </div>
    </nav>
  );
}

function NavBtn({ to, label, primary }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <button
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          padding: "8px 18px", borderRadius: "9px", fontSize: "13px", fontWeight: "700",
          fontFamily: F.body, cursor: "pointer", transition: "all 0.2s",
          background: primary ? (hov ? C.tealDark : C.teal) : (hov ? C.tealFaint : "transparent"),
          color: primary ? C.white : (hov ? C.teal : C.textMid),
          border: primary ? "none" : `1.5px solid ${hov ? C.teal : C.border}`,
          boxShadow: primary && hov ? "0 4px 16px rgba(11,110,110,0.3)" : "none",
        }}>{label}</button>
    </Link>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: "20px", height: "20px" }}>
      <rect x="10" y="3" width="4" height="18" rx="2" fill="white" />
      <rect x="3"  y="10" width="18" height="4" rx="2" fill="white" />
    </svg>
  );
}

function HeroCard() {
  return (
    <div style={{
      background: C.white, borderRadius: "22px", padding: "26px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.06)",
      maxWidth: "340px", width: "100%",
      animation: "floatY 4s ease-in-out infinite",
    }}>
      {/* Doctor row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: C.white, fontFamily: F.display, flexShrink: 0 }}>PS</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: C.text, fontFamily: F.body }}>Dr. Priya Sharma</div>
          <div style={{ fontSize: "12px", color: C.textLight, fontFamily: F.body }}>Cardiologist · 12 yrs exp.</div>
        </div>
        <div style={{ background: C.tealFaint, borderRadius: "20px", padding: "3px 9px", fontSize: "12px", fontWeight: "600", color: C.teal, flexShrink: 0 }}>⭐ 4.9</div>
      </div>

      {/* Appointment block */}
      <div style={{ background: C.tealFaint, borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", border: `1px solid ${C.tealMid}` }}>
        <div style={{ fontSize: "10px", color: C.textLight, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Next Appointment</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>📅 March 14, 2026</div>
            <div style={{ fontSize: "11px", color: C.textLight, marginTop: "2px" }}>10:30 AM – 11:00 AM</div>
          </div>
          <div style={{ padding: "3px 10px", background: "#e8faf2", color: "#1a7a52", border: "1px solid #86d4ad", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>Confirmed</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[["👥","2,400+","Patients"],["🩺","180+","Doctors"],["⭐","4.9/5","Rating"]].map(([ic,val,lbl]) => (
          <div key={lbl} style={{ textAlign: "center", padding: "9px 4px", background: C.offwhite, borderRadius: "9px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "14px", marginBottom: "2px" }}>{ic}</div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: C.text, fontFamily: F.body }}>{val}</div>
            <div style={{ fontSize: "10px", color: C.textLight, fontFamily: F.body }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "26px 22px", borderRadius: "16px",
        border: `1.5px solid ${hov ? C.teal : C.border}`,
        background: hov ? C.tealFaint : C.white,
        boxShadow: hov ? "0 10px 36px rgba(11,110,110,0.10)" : "none",
        transition: "all 0.25s", transform: hov ? "translateY(-4px)" : "none",
        cursor: "default",
      }}>
      <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }}>{icon}</div>
      <h3 style={{ fontFamily: F.display, fontSize: "17px", fontWeight: "600", color: C.text, marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: C.textLight, lineHeight: "1.7", fontFamily: F.body }}>{desc}</p>
    </div>
  );
}

function StepCard({ n, icon, title, desc }) {
  return (
    <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "0 8px" }}>
      <div style={{ position: "relative", marginBottom: "18px" }}>
        <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto", boxShadow: "0 8px 24px rgba(11,110,110,0.22)" }}>{icon}</div>
        <div style={{ position: "absolute", top: "-8px", right: "calc(50% - 38px)", background: C.white, border: `1.5px solid ${C.tealMid}`, borderRadius: "7px", padding: "2px 7px", fontSize: "10px", fontWeight: "800", color: C.teal, fontFamily: F.body }}>{n}</div>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: "16px", fontWeight: "600", color: C.text, marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: C.textLight, lineHeight: "1.7", fontFamily: F.body }}>{desc}</p>
    </div>
  );
}

function DoctorCard({ d }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.white, borderRadius: "16px", padding: "20px",
        border: `1.5px solid ${hov ? C.teal : C.border}`,
        boxShadow: hov ? "0 10px 36px rgba(11,110,110,0.13)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.25s", transform: hov ? "translateY(-3px)" : "none",
        cursor: "pointer",
      }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `linear-gradient(135deg,${d.col},${d.col}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: C.white, fontFamily: F.display, marginBottom: "12px" }}>{d.av}</div>
      <div style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "2px", fontFamily: F.body }}>{d.name}</div>
      <div style={{ fontSize: "12px", color: C.teal, fontWeight: "600", marginBottom: "10px", fontFamily: F.body }}>{d.spec}</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: C.textLight, fontFamily: F.body }}>⭐ {d.rating} ({d.reviews})</span>
        <span style={{ fontSize: "11px", color: C.textLight, fontFamily: F.body }}>{d.exp}</span>
      </div>
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "26px", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(8px)" }}>
      <div style={{ color: "#f5c842", fontSize: "14px", marginBottom: "14px", letterSpacing: "2px" }}>{"★".repeat(t.stars)}</div>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", lineHeight: "1.8", marginBottom: "20px", fontStyle: "italic", fontFamily: F.body }}>"{t.quote}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: `linear-gradient(135deg,${C.tealLight},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: C.white, flexShrink: 0 }}>{t.av}</div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: C.white, fontFamily: F.body }}>{t.name}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: F.body }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  return (
    <footer style={{ background: `linear-gradient(170deg,${C.tealDeep} 0%,#041e1e 100%)`, color: "rgba(255,255,255,0.65)", padding: "64px 5% 28px", fontFamily: F.body }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "44px", marginBottom: "48px" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
              <div style={{ width: "34px", height: "34px", background: C.tealLight, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><CrossIcon /></div>
              <span style={{ fontFamily: F.display, fontSize: "20px", fontWeight: "700", color: C.white }}>MediCare</span>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.8", maxWidth: "220px", color: "rgba(255,255,255,0.42)" }}>Your trusted healthcare portal — connecting patients with verified doctors.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              {["𝕏", "in", "f"].map((ic, i) => (
                <div key={i} style={{ width: "32px", height: "32px", borderRadius: "7px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}>{ic}</div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Platform", links: ["Features", "Find Doctors", "For Doctors"] },
            { title: "Company",  links: ["About", "Careers", "Blog", "Contact"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: C.white, textTransform: "uppercase", marginBottom: "16px" }}>{col.title}</h4>
              {col.links.map(l => <div key={l} style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", marginBottom: "9px", cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: C.white, textTransform: "uppercase", marginBottom: "16px" }}>Newsletter</h4>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", marginBottom: "12px", lineHeight: "1.7" }}>Health tips & updates in your inbox.</p>
            {subbed ? (
              <div style={{ color: "#7ee8a2", fontSize: "13px", fontWeight: "600" }}>✓ Subscribed!</div>
            ) : (
              <div style={{ display: "flex", gap: "7px" }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ flex: 1, padding: "9px 11px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: C.white, fontSize: "12px", outline: "none", fontFamily: F.body }} />
                <button onClick={() => email && setSubbed(true)}
                  style={{ padding: "9px 13px", background: C.tealLight, color: C.white, border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>→</button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)" }}>© 2026 MediCare Health Portal. All rights reserved.</p>
          <div style={{ display: "flex", gap: "18px" }}>
            {["Privacy Policy", "Terms of Service"].map(l => <span key={l} style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", cursor: "pointer" }}>{l}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── HeroButton ────────────────────────────────────────────────────────────── */
function HeroBtn({ to, label }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          padding: "13px 24px", borderRadius: "11px", fontSize: "14px", fontWeight: "700",
          fontFamily: F.body, cursor: "pointer", transition: "all 0.2s",
          background: hov ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.13)",
          color: hov ? C.teal : C.white,
          border: "1.5px solid rgba(255,255,255,0.35)",
          backdropFilter: "blur(8px)",
          boxShadow: hov ? "0 4px 18px rgba(0,0,0,0.18)" : "none",
        }}>{label}</button>
    </Link>
  );
}

/* ── Section label ─────────────────────────────────────────────────────────── */
function SectionTag({ label, dark }) {
  return (
    <span style={{
      display: "inline-block", fontSize: "11px", fontWeight: "700",
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: dark ? "#7ee8e8" : C.teal,
      background: dark ? "rgba(255,255,255,0.08)" : C.tealFaint,
      border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.tealMid}`,
      padding: "5px 14px", borderRadius: "999px", marginBottom: "14px",
      fontFamily: F.body,
    }}>{label}</span>
  );
}

/* ── HomePage ──────────────────────────────────────────────────────────────── */
const HomePage = () => {
  const [carIdx, setCarIdx] = useState(0);
  const visible = [...DOCTORS, ...DOCTORS].slice(carIdx, carIdx + 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f7fbfb; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #9bcece; border-radius: 10px; }
      `}</style>

      <div style={{ fontFamily: F.body, color: C.text }}>
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{
          minHeight: "100vh", paddingTop: "62px",
          background: `linear-gradient(150deg,${C.tealDeep} 0%,${C.tealDark} 48%,#0d5c5c 100%)`,
          display: "flex", alignItems: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* bg effects */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(circle at 15% 60%, rgba(20,168,168,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.04) 0%, transparent 40%)` }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "54px 54px" }} />

          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 5%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", width: "100%" }}>
            {/* Copy */}
            <div style={{ animation: "fadeUp 0.7s ease forwards" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px", padding: "5px 14px 5px 7px",
                fontSize: "12px", color: "rgba(255,255,255,0.8)",
                marginBottom: "26px", backdropFilter: "blur(8px)",
              }}>
                <span style={{ background: C.tealLight, borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: "700", color: C.white }}>New</span>
                180+ Verified Doctors Now Available
              </div>

              <h1 style={{ fontFamily: F.display, fontSize: "clamp(34px,4.5vw,54px)", fontWeight: "700", color: C.white, lineHeight: "1.1", marginBottom: "20px" }}>
                Healthcare,<br />
                <span style={{ fontStyle: "italic", color: "#7ee8e8" }}>reimagined</span><br />
                for everyone.
              </h1>

              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.75", maxWidth: "400px", marginBottom: "36px", fontFamily: F.body }}>
                Book appointments with verified specialists, manage your health records, and get the care you deserve — all in one place.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <HeroBtn to="/signup"        label="🚀 Get Started"      />
                <HeroBtn to="/signup"        label="🔍 Find a Doctor"     />
                <HeroBtn to="/doctor-signup" label="🩺 Become a Doctor"   />
              </div>

              {/* Trust bar */}
              <div style={{ display: "flex", gap: "28px", marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px" }}>
                {[["2,400+","Patients"],["180+","Doctors"],["98%","Satisfaction"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: F.display, fontSize: "22px", fontWeight: "700", color: C.white }}>{n}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px", fontFamily: F.body }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div style={{ display: "flex", justifyContent: "center", animation: "fadeUp 0.9s ease forwards" }}>
              <HeroCard />
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section id="features" style={{ padding: "92px 5%", background: C.white }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <SectionTag label="Why MediCare" />
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: "700", color: C.text, marginBottom: "12px" }}>Everything you need for better healthcare</h2>
              <p style={{ fontSize: "15px", color: C.textLight, maxWidth: "520px", margin: "0 auto", lineHeight: "1.7", fontFamily: F.body }}>From finding the right doctor to managing your health journey — we've got you covered.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px" }}>
              {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ padding: "92px 5%", background: C.offwhite }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <SectionTag label="How It Works" />
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: "700", color: C.text, marginBottom: "12px" }}>Get care in four simple steps</h2>
              <p style={{ fontSize: "15px", color: C.textLight, lineHeight: "1.7", fontFamily: F.body }}>Start your healthcare journey today — it only takes a few minutes.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", position: "relative" }}>
              {/* connector */}
              <div style={{ position: "absolute", top: "34px", left: "12.5%", right: "12.5%", height: "2px", background: `linear-gradient(90deg,${C.teal},${C.tealLight})`, opacity: 0.2 }} />
              {STEPS.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── BROWSE DOCTORS ───────────────────────────────────────────────── */}
        <section id="doctors" style={{ padding: "92px 5%", background: C.white }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
              <div>
                <SectionTag label="Our Specialists" />
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px,3vw,34px)", fontWeight: "700", color: C.text }}>Meet our top doctors</h2>
              </div>
              <div style={{ display: "flex", gap: "10px", paddingBottom: "4px" }}>
                {[["←", () => setCarIdx(i => Math.max(0, i - 1))], ["→", () => setCarIdx(i => (i + 1) % DOCTORS.length)]].map(([lbl, fn], i) => (
                  <button key={lbl} onClick={fn} style={{ width: "38px", height: "38px", borderRadius: "50%", border: lbl === "→" ? "none" : `1.5px solid ${C.border}`, background: lbl === "→" ? C.teal : C.white, color: lbl === "→" ? C.white : C.textMid, cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" }}>
              {visible.map((d, i) => <DoctorCard key={i} d={d} />)}
            </div>
            <div style={{ textAlign: "center", marginTop: "36px" }}>
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <button style={{ padding: "13px 32px", background: C.teal, color: C.white, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", fontFamily: F.body, cursor: "pointer", boxShadow: "0 4px 18px rgba(11,110,110,0.25)" }}>
                  View All Doctors →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section style={{ padding: "92px 5%", background: `linear-gradient(150deg,${C.tealDeep} 0%,#041e1e 100%)` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <SectionTag label="Testimonials" dark />
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: "700", color: C.white, marginBottom: "12px" }}>
                What people are <span style={{ fontStyle: "italic", color: "#7ee8e8" }}>saying</span>
              </h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.48)", lineHeight: "1.7", fontFamily: F.body }}>Real stories from patients and doctors who trust MediCare.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
              {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 5%", background: C.white }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, borderRadius: "26px", padding: "60px 40px", boxShadow: "0 20px 60px rgba(11,110,110,0.24)" }}>
            <h2 style={{ fontFamily: F.display, fontSize: "32px", fontWeight: "700", color: C.white, marginBottom: "12px" }}>Ready to take control of your health?</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.72)", marginBottom: "30px", lineHeight: "1.7", fontFamily: F.body }}>Join thousands of patients and doctors already on MediCare.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <HeroBtn to="/signup" label="Sign Up Free" />
              <HeroBtn to="/login"  label="Sign In"      />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;