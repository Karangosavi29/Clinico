import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments, cancelAppointment, rescheduleAppointment } from "../../api/appointmentApi";
import { getAllDoctors, getDoctorAvailability } from "../../api/doctorApi";

/* ── tokens ── */
const C = {
  teal:"#0B6E6E",tealDark:"#085252",tealDeep:"#063d3d",tealLight:"#14a8a8",
  tealFaint:"#f0fafa",tealMid:"#d4eeee",text:"#1a2e2e",textMid:"#3d6060",
  textLight:"#6a9090",white:"#ffffff",offwhite:"#f7fbfb",border:"#d4e9e9",
  error:"#c0392b",errorFaint:"#fff1f0",success:"#1a7a52",successFaint:"#f0faf5",
  warn:"#b45309",warnFaint:"#fffbeb",
};
const F = { display:"'Playfair Display', serif", body:"'DM Sans', sans-serif" };

const STATUS_COLORS = {
  pending:   { bg:"#fffbeb", color:"#b45309", border:"#fcd34d" },
  booked:    { bg:"#eff6ff", color:"#1d4ed8", border:"#93c5fd" },
  approved:  { bg:C.successFaint, color:C.success, border:"#86d4ad" },
  cancelled: { bg:C.errorFaint, color:C.error, border:"#f5b8b8" },
  completed: { bg:"#f5f3ff", color:"#6d28d9", border:"#c4b5fd" },
};

/* ── helpers ── */
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
const fmtFull = (d) => new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" });

/* ── small components ── */
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700",
      background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontFamily:F.body }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}>
      <div style={{ width:"36px", height:"36px", border:`3px solid ${C.tealMid}`,
        borderTopColor:C.teal, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const s = type === "error"
    ? { bg:C.errorFaint, border:"#f5b8b8", color:C.error }
    : { bg:C.successFaint, border:"#86d4ad", color:C.success };
  return (
    <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:999,
      background:s.bg, border:`1px solid ${s.border}`, color:s.color,
      padding:"12px 18px", borderRadius:"12px", fontSize:"13px", fontFamily:F.body,
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)", display:"flex", alignItems:"center", gap:"10px",
      animation:"slideUp 0.3s ease" }}>
      <span>{type === "error" ? "⚠" : "✓"} {msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
        color:s.color, fontSize:"16px", lineHeight:1 }}>×</button>
    </div>
  );
}

/* ── Book Appointment Modal ── */
function BookModal({ onClose, onBooked }) {
  const [step, setStep] = useState(1); // 1=pick doctor, 2=pick slot
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({ date:"", timeSlot:"", notes:"" });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllDoctors().then(setDoctors).catch(console.error);
  }, []);

  const selectDoctor = async (doc) => {
    setSelected(doc);
    try {
      const avail = await getDoctorAvailability(doc._id);
      setAvailability(avail || []);
    } catch { setAvailability([]); }
    setStep(2);
  };

  const handleDateChange = (date) => {
    setForm(f => ({ ...f, date, timeSlot:"" }));
    const day = new Date(date).toLocaleString("en-US", { weekday:"long" });
    const dayAvail = availability.find(a => a.day === day);
    setSlots(dayAvail?.slots || []);
  };

  const handleBook = async () => {
    if (!form.date || !form.timeSlot) { setError("Please select date and time slot"); return; }
    setLoading(true); setError("");
    try {
      const { bookAppointment } = await import("../../api/appointmentApi");
      await bookAppointment({ doctorId: selected._id, date: form.date, timeSlot: form.timeSlot, notes: form.notes });
      onBooked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(6,61,61,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"540px",
        maxHeight:"85vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
        {/* Header */}
        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:F.display, fontSize:"22px", color:C.text }}>
            {step === 1 ? "Select a Doctor" : `Book with ${selected?.userId?.name || "Doctor"}`}
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px",
            cursor:"pointer", color:C.textLight, lineHeight:1 }}>×</button>
        </div>

        <div style={{ padding:"20px 28px 28px" }}>
          {step === 1 && (
            <>
              <p style={{ fontSize:"13px", color:C.textLight, marginBottom:"16px" }}>Choose a specialist for your appointment</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {doctors.map(doc => (
                  <div key={doc._id} onClick={() => selectDoctor(doc)}
                    style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 16px",
                      border:`1.5px solid ${C.border}`, borderRadius:"12px", cursor:"pointer",
                      transition:"all 0.2s", background:C.tealFaint }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ width:"44px", height:"44px", borderRadius:"50%", flexShrink:0,
                      background:`linear-gradient(135deg,${C.teal},${C.tealLight})`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"14px", fontWeight:"700", color:C.white }}>
                      {(doc.userId?.name || "Dr").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"14px", fontWeight:"700", color:C.text }}>{doc.userId?.name || "—"}</div>
                      <div style={{ fontSize:"12px", color:C.teal, fontWeight:"600" }}>{doc.specialization}</div>
                      <div style={{ fontSize:"11px", color:C.textLight }}>{doc.experience} yrs exp · ⭐ {doc.avgRating?.toFixed(1) || "—"}</div>
                    </div>
                    <span style={{ color:C.teal, fontSize:"18px" }}>→</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={{ background:"none", border:"none",
                color:C.teal, cursor:"pointer", fontSize:"13px", fontWeight:"600",
                padding:"0 0 16px 0", display:"flex", alignItems:"center", gap:"5px" }}>
                ← Back to doctors
              </button>

              {error && (
                <div style={{ padding:"10px 14px", borderRadius:"9px", marginBottom:"14px",
                  background:C.errorFaint, border:"1px solid #f5b8b8", color:C.error, fontSize:"13px" }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ marginBottom:"16px" }}>
                <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
                  textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>Date *</label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => handleDateChange(e.target.value)}
                  style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`,
                    borderRadius:"10px", fontSize:"14px", fontFamily:F.body, color:C.text,
                    background:C.tealFaint, outline:"none", boxSizing:"border-box" }} />
              </div>

              {form.date && (
                <div style={{ marginBottom:"16px" }}>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
                    textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"8px" }}>
                    Available Slots for {new Date(form.date).toLocaleString("en-US",{weekday:"long"})}
                  </label>
                  {slots.length === 0 ? (
                    <div style={{ padding:"12px", background:C.errorFaint, borderRadius:"9px",
                      color:C.error, fontSize:"13px", textAlign:"center" }}>
                      No slots available for this day
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                      {slots.map(slot => (
                        <button key={slot} type="button"
                          onClick={() => setForm(f => ({ ...f, timeSlot:slot }))}
                          style={{ padding:"8px 14px", borderRadius:"8px", fontSize:"13px", fontWeight:"600",
                            cursor:"pointer", transition:"all 0.15s", fontFamily:F.body,
                            background: form.timeSlot === slot ? C.teal : C.white,
                            color: form.timeSlot === slot ? C.white : C.teal,
                            border: `1.5px solid ${form.timeSlot === slot ? C.teal : C.border}` }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom:"20px" }}>
                <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
                  textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>
                  Notes (optional)
                </label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))}
                  placeholder="Describe your symptoms or reason for visit…"
                  rows={3}
                  style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`,
                    borderRadius:"10px", fontSize:"14px", fontFamily:F.body, color:C.text,
                    background:C.tealFaint, outline:"none", resize:"vertical", boxSizing:"border-box" }} />
              </div>

              <button onClick={handleBook} disabled={loading}
                style={{ width:"100%", padding:"13px", background: loading ? "#6aadad" : C.teal,
                  color:C.white, border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:"700",
                  fontFamily:F.body, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow:"0 4px 18px rgba(11,110,110,0.25)" }}>
                {loading ? "Booking…" : "Confirm Appointment"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reschedule Modal ── */
function RescheduleModal({ appointment, onClose, onRescheduled }) {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({ date:"", timeSlot:"" });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = appointment?.doctorId?._id || appointment?.doctorId;
    if (id) getDoctorAvailability(id).then(setAvailability).catch(()=>setAvailability([]));
  }, [appointment]);

  const handleDateChange = (date) => {
    setForm(f => ({ ...f, date, timeSlot:"" }));
    const day = new Date(date).toLocaleString("en-US", { weekday:"long" });
    const dayAvail = availability.find(a => a.day === day);
    setSlots(dayAvail?.slots || []);
  };

  const handleReschedule = async () => {
    if (!form.date || !form.timeSlot) { setError("Select date and time slot"); return; }
    setLoading(true); setError("");
    try {
      await rescheduleAppointment(appointment._id, form);
      onRescheduled();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Reschedule failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(6,61,61,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"440px",
        boxShadow:"0 24px 64px rgba(0,0,0,0.22)", padding:"28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <h3 style={{ fontFamily:F.display, fontSize:"21px", color:C.text }}>Reschedule Appointment</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", color:C.textLight }}>×</button>
        </div>

        {error && <div style={{ padding:"10px 14px", borderRadius:"9px", marginBottom:"14px", background:C.errorFaint, border:"1px solid #f5b8b8", color:C.error, fontSize:"13px" }}>⚠ {error}</div>}

        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>New Date *</label>
          <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
            onChange={e => handleDateChange(e.target.value)}
            style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`, borderRadius:"10px", fontSize:"14px", fontFamily:F.body, background:C.tealFaint, outline:"none", boxSizing:"border-box" }} />
        </div>

        {form.date && (
          <div style={{ marginBottom:"20px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"8px" }}>
              Available Slots
            </label>
            {slots.length === 0
              ? <div style={{ padding:"12px", background:C.errorFaint, borderRadius:"9px", color:C.error, fontSize:"13px", textAlign:"center" }}>No slots available</div>
              : <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {slots.map(slot => (
                    <button key={slot} type="button" onClick={() => setForm(f => ({ ...f, timeSlot:slot }))}
                      style={{ padding:"8px 14px", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:F.body,
                        background: form.timeSlot === slot ? C.teal : C.white,
                        color: form.timeSlot === slot ? C.white : C.teal,
                        border: `1.5px solid ${form.timeSlot === slot ? C.teal : C.border}` }}>
                      {slot}
                    </button>
                  ))}
                </div>
            }
          </div>
        )}

        <button onClick={handleReschedule} disabled={loading}
          style={{ width:"100%", padding:"13px", background: loading ? "#6aadad" : C.teal,
            color:C.white, border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:"700",
            fontFamily:F.body, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Rescheduling…" : "Confirm Reschedule"}
        </button>
      </div>
    </div>
  );
}

/* ── Appointment Card ── */
function AppointmentCard({ appt, onCancel, onReschedule }) {
  const doctorName = appt.doctorId?.userId?.name || appt.doctorId?.name || "Doctor";
  const doctorSpec = appt.doctorId?.specialization || "Specialist";
  const canCancel = appt.status === "booked" || appt.status === "pending";
  const canReschedule = appt.status === "pending" || appt.status === "approved";

  return (
    <div style={{ background:C.white, borderRadius:"14px", padding:"18px 20px",
      border:`1.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      transition:"box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(11,110,110,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          <div style={{ width:"42px", height:"42px", borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg,${C.teal},${C.tealLight})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"13px", fontWeight:"700", color:C.white }}>
            {doctorName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:"700", color:C.text }}>{doctorName}</div>
            <div style={{ fontSize:"12px", color:C.teal, fontWeight:"600" }}>{doctorSpec}</div>
          </div>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"14px" }}>
        <div style={{ background:C.tealFaint, borderRadius:"9px", padding:"8px 10px" }}>
          <div style={{ fontSize:"10px", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"2px" }}>Date</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:C.text }}>📅 {fmtFull(appt.date)}</div>
        </div>
        <div style={{ background:C.tealFaint, borderRadius:"9px", padding:"8px 10px" }}>
          <div style={{ fontSize:"10px", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"2px" }}>Time</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:C.text }}>🕐 {appt.timeSlot}</div>
        </div>
      </div>

      {appt.notes && (
        <div style={{ fontSize:"12px", color:C.textLight, background:C.offwhite, borderRadius:"8px", padding:"8px 10px", marginBottom:"12px" }}>
          📝 {appt.notes}
        </div>
      )}

      {(canCancel || canReschedule) && (
        <div style={{ display:"flex", gap:"8px" }}>
          {canReschedule && (
            <button onClick={() => onReschedule(appt)}
              style={{ flex:1, padding:"8px", background:C.white, color:C.teal,
                border:`1.5px solid ${C.teal}`, borderRadius:"9px", fontSize:"12px",
                fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
              Reschedule
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(appt._id)}
              style={{ flex:1, padding:"8px", background:C.errorFaint, color:C.error,
                border:`1px solid #f5b8b8`, borderRadius:"9px", fontSize:"12px",
                fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── PatientDashboard ── */
export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | past | all
  const [showBook, setShowBook] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAppointments({ limit: 50 });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Failed to load appointments", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      showToast("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || "Cancel failed", "error");
    }
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  // Filter appointments
  const now = new Date();
  const filtered = appointments.filter(a => {
    if (activeTab === "upcoming") return new Date(a.date) >= now && a.status !== "cancelled";
    if (activeTab === "past") return new Date(a.date) < now || a.status === "completed" || a.status === "cancelled";
    return true;
  });

  // Stats
  const total     = appointments.length;
  const upcoming  = appointments.filter(a => new Date(a.date) >= now && a.status !== "cancelled").length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#9bcece; border-radius:10px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.offwhite, fontFamily:F.body }}>

        {/* ── Topbar ── */}
        <header style={{ background:C.white, borderBottom:`1px solid ${C.tealMid}`,
          padding:"0 5%", height:"62px", display:"flex", alignItems:"center",
          justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:"9px", textDecoration:"none" }}>
            <div style={{ width:"32px", height:"32px", background:C.teal, borderRadius:"8px",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width:"18px", height:"18px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white"/>
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily:F.display, fontSize:"18px", fontWeight:"700", color:C.teal }}>MediCare</span>
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ fontSize:"13px", color:C.textMid }}>
              👋 <strong>{user?.name || "Patient"}</strong>
            </div>
            <button onClick={handleLogout}
              style={{ padding:"7px 16px", background:C.errorFaint, color:C.error,
                border:`1px solid #f5b8b8`, borderRadius:"8px", fontSize:"12px",
                fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
              Logout
            </button>
          </div>
        </header>

        <main style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 5%" }}>

          {/* ── Page title + Book button ── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px", animation:"fadeUp 0.5s ease" }}>
            <div>
              <h1 style={{ fontFamily:F.display, fontSize:"28px", fontWeight:"700", color:C.text, marginBottom:"4px" }}>
                Patient Dashboard
              </h1>
              <p style={{ fontSize:"13px", color:C.textLight }}>Manage your appointments and health journey</p>
            </div>
            <button onClick={() => setShowBook(true)}
              style={{ padding:"11px 22px", background:C.teal, color:C.white,
                border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:"700",
                cursor:"pointer", fontFamily:F.body, display:"flex", alignItems:"center", gap:"7px",
                boxShadow:"0 4px 16px rgba(11,110,110,0.25)" }}>
              + Book Appointment
            </button>
          </div>

          {/* ── Stats ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"28px", animation:"fadeUp 0.6s ease" }}>
            {[
              { label:"Total",     val:total,     icon:"📋", col:C.teal },
              { label:"Upcoming",  val:upcoming,  icon:"📅", col:"#1d4ed8" },
              { label:"Completed", val:completed, icon:"✅", col:C.success },
              { label:"Cancelled", val:cancelled, icon:"❌", col:C.error },
            ].map(s => (
              <div key={s.label} style={{ background:C.white, borderRadius:"14px", padding:"18px",
                border:`1.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:"22px", marginBottom:"8px" }}>{s.icon}</div>
                <div style={{ fontSize:"26px", fontWeight:"700", color:s.col, fontFamily:F.display }}>{s.val}</div>
                <div style={{ fontSize:"12px", color:C.textLight, marginTop:"2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs + Appointments ── */}
          <div style={{ background:C.white, borderRadius:"16px", border:`1px solid ${C.border}`,
            boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden", animation:"fadeUp 0.7s ease" }}>
            {/* Tab bar */}
            <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, padding:"0 20px" }}>
              {[["upcoming","Upcoming"],["past","Past"],["all","All"]].map(([key,label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{ padding:"14px 18px", background:"none", border:"none",
                    borderBottom: activeTab === key ? `2px solid ${C.teal}` : "2px solid transparent",
                    color: activeTab === key ? C.teal : C.textLight,
                    fontSize:"13px", fontWeight:"700", cursor:"pointer",
                    fontFamily:F.body, transition:"all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding:"20px" }}>
              {loading ? <Spinner /> : filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ fontSize:"48px", marginBottom:"14px" }}>📭</div>
                  <h3 style={{ fontFamily:F.display, fontSize:"20px", color:C.text, marginBottom:"8px" }}>No appointments found</h3>
                  <p style={{ fontSize:"13px", color:C.textLight, marginBottom:"20px" }}>
                    {activeTab === "upcoming" ? "You have no upcoming appointments." : "Nothing here yet."}
                  </p>
                  <button onClick={() => setShowBook(true)}
                    style={{ padding:"10px 22px", background:C.teal, color:C.white, border:"none",
                      borderRadius:"10px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>
                    Book your first appointment
                  </button>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"14px" }}>
                  {filtered.map(appt => (
                    <AppointmentCard key={appt._id} appt={appt}
                      onCancel={handleCancel}
                      onReschedule={setRescheduleAppt} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showBook && <BookModal onClose={() => setShowBook(false)} onBooked={() => { fetchAppointments(); showToast("Appointment booked!"); }} />}
      {rescheduleAppt && <RescheduleModal appointment={rescheduleAppt} onClose={() => setRescheduleAppt(null)} onRescheduled={() => { fetchAppointments(); showToast("Appointment rescheduled!"); }} />}
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}