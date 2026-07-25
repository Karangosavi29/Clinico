import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments, updateAppointment,approveAppointment  } from "../../api/appointmentApi";
import { getDoctorStats, updateAvailability } from "../../api/doctorApi";

const C = {
  teal:"#0B6E6E",tealDark:"#085252",tealDeep:"#063d3d",tealLight:"#14a8a8",
  tealFaint:"#f0fafa",tealMid:"#d4eeee",text:"#1a2e2e",textMid:"#3d6060",
  textLight:"#6a9090",white:"#ffffff",offwhite:"#f7fbfb",border:"#d4e9e9",
  error:"#c0392b",errorFaint:"#fff1f0",success:"#1a7a52",successFaint:"#f0faf5",
};
const F = { display:"'Playfair Display', serif", body:"'DM Sans', sans-serif" };

const STATUS_COLORS = {
  pending:   { bg:"#fffbeb", color:"#b45309", border:"#fcd34d" },
  booked:    { bg:"#eff6ff", color:"#1d4ed8", border:"#93c5fd" },
  approved:  { bg:C.successFaint, color:C.success, border:"#86d4ad" },
  cancelled: { bg:C.errorFaint, color:C.error, border:"#f5b8b8" },
  completed: { bg:"#f5f3ff", color:"#6d28d9", border:"#c4b5fd" },
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DEFAULT_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700",
      background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}>
      <div style={{ width:"32px", height:"32px", border:`3px solid ${C.tealMid}`,
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
      padding:"12px 18px", borderRadius:"12px", fontSize:"13px",
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)", display:"flex", gap:"10px" }}>
      {type === "error" ? "⚠" : "✓"} {msg}
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:s.color, fontSize:"16px" }}>×</button>
    </div>
  );
}

/* ── Availability Manager ── */
function AvailabilityManager({ doctorId, onSaved }) {
  const [avail, setAvail] = useState(
    DAYS.map(day => ({ day, slots: [], enabled: false }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (day) => {
    setAvail(a => a.map(d => d.day === day ? { ...d, enabled: !d.enabled, slots: !d.enabled ? [] : d.slots } : d));
  };

  const toggleSlot = (day, slot) => {
    setAvail(a => a.map(d => {
      if (d.day !== day) return d;
      const slots = d.slots.includes(slot) ? d.slots.filter(s => s !== slot) : [...d.slots, slot];
      return { ...d, slots };
    }));
  };

  const handleSave = async () => {
    setLoading(true); setError("");
    try {
      const payload = avail.filter(d => d.enabled && d.slots.length > 0).map(d => ({ day: d.day, slots: d.slots }));
      await updateAvailability(doctorId, payload);
      onSaved("Availability updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save availability");
    } finally { setLoading(false); }
  };

  return (
    <div>
      {error && <div style={{ padding:"10px 14px", borderRadius:"9px", marginBottom:"14px", background:C.errorFaint, border:"1px solid #f5b8b8", color:C.error, fontSize:"13px" }}>⚠ {error}</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"20px" }}>
        {avail.map(({ day, slots, enabled }) => (
          <div key={day} style={{ border:`1.5px solid ${enabled ? C.teal : C.border}`, borderRadius:"12px", overflow:"hidden", transition:"border-color 0.2s" }}>
            <div onClick={() => toggleDay(day)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"12px 16px", cursor:"pointer",
                background: enabled ? C.tealFaint : C.white }}>
              <span style={{ fontSize:"14px", fontWeight:"700", color: enabled ? C.teal : C.textMid }}>{day}</span>
              <div style={{ width:"38px", height:"20px", borderRadius:"10px",
                background: enabled ? C.teal : C.border, position:"relative", transition:"background 0.2s" }}>
                <div style={{ position:"absolute", top:"2px", width:"16px", height:"16px",
                  borderRadius:"50%", background:C.white,
                  left: enabled ? "20px" : "2px", transition:"left 0.2s",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
            {enabled && (
              <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.tealMid}`, background:C.white }}>
                <p style={{ fontSize:"11px", color:C.textLight, marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:"700" }}>Select time slots</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                  {DEFAULT_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => toggleSlot(day, slot)}
                      style={{ padding:"6px 12px", borderRadius:"7px", fontSize:"12px", fontWeight:"600",
                        cursor:"pointer", fontFamily:F.body, transition:"all 0.15s",
                        background: slots.includes(slot) ? C.teal : C.white,
                        color: slots.includes(slot) ? C.white : C.teal,
                        border: `1.5px solid ${slots.includes(slot) ? C.teal : C.border}` }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={loading}
        style={{ width:"100%", padding:"12px", background: loading ? "#6aadad" : C.teal,
          color:C.white, border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:"700",
          fontFamily:F.body, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "Saving…" : "Save Availability"}
      </button>
    </div>
  );
}

/* ── Appointment Row ── */
function AppointmentRow({ appt, onStatusChange }) {
  const patientName = appt.patientId?.name || "Patient";
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await updateAppointment(appt._id, { status });
      onStatusChange();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally { setUpdating(false); }
  };

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await approveAppointment(appt._id);
      onStatusChange();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    } finally { setUpdating(false); }
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
      gap:"12px", alignItems:"center", padding:"14px 16px",
      borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = C.tealFaint}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:`linear-gradient(135deg,${C.teal},${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:C.white, flexShrink:0 }}>
          {patientName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>{patientName}</div>
          <div style={{ fontSize:"11px", color:C.textLight }}>{appt.patientId?.email || "—"}</div>
        </div>
      </div>
      <div style={{ fontSize:"13px", color:C.text }}>
        {new Date(appt.date).toLocaleDateString("en-IN",{ day:"numeric",month:"short" })}
      </div>
      <div style={{ fontSize:"13px", color:C.text }}>🕐 {appt.timeSlot}</div>
      <StatusBadge status={appt.status} />
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
        {appt.status === "pending" && (
          <button onClick={handleApprove} disabled={updating}
            style={{ padding:"5px 10px", background:C.successFaint, color:C.success,
              border:`1px solid #86d4ad`, borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
            ✓ Approve
          </button>
        )}
        {appt.status === "approved" && (
          <button onClick={() => handleStatus("completed")} disabled={updating}
            style={{ padding:"5px 10px", background:C.successFaint, color:C.success,
              border:`1px solid #86d4ad`, borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
            ✓ Done
          </button>
        )}
        {(appt.status === "approved" || appt.status === "pending") && (
          <button onClick={() => handleStatus("cancelled")} disabled={updating}
            style={{ padding:"5px 10px", background:C.errorFaint, color:C.error,
              border:`1px solid #f5b8b8`, borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
            ✕
          </button>
        )}
        {appt.status === "approved" && appt.meetingLink && (
          <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer"
            style={{ padding:"5px 10px", background:"#eff6ff", color:"#1d4ed8",
              border:"1px solid #93c5fd", borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", textDecoration:"none", fontFamily:F.body, whiteSpace:"nowrap" }}>
            🎥 Join
          </a>
        )}
      </div>
    </div>
  );
}

/* ── DoctorDashboard ── */
export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today"); // today | upcoming | completed
  const [activePanel, setActivePanel] = useState("appointments"); // appointments | availability
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, st] = await Promise.all([
        getAppointments({ limit:100 }),
        getDoctorStats().catch(() => null),
      ]);
      setAppointments(Array.isArray(appts) ? appts : []);
      setStats(st);
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const now = new Date();
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

  const filtered = appointments.filter(a => {
    const d = new Date(a.date);
    if (activeTab === "today") return d >= todayStart && d <= todayEnd;
    if (activeTab === "upcoming") return d > todayEnd && a.status !== "cancelled";
    if (activeTab === "completed") return a.status === "completed";
    return true;
  });

  // Stat cards
  const statCards = [
    { label:"Total Patients",    val: stats?.uniquePatients ?? appointments.filter((a,i,arr)=>arr.findIndex(b=>b.patientId?._id===a.patientId?._id)===i).length, icon:"👥", col:"#1d4ed8" },
    { label:"Upcoming",          val: stats?.upcoming ?? appointments.filter(a=>new Date(a.date)>=now && a.status!=="cancelled").length, icon:"📅", col:C.teal },
    { label:"Completed",         val: stats?.completed ?? appointments.filter(a=>a.status==="completed").length, icon:"✅", col:C.success },
    { label:"Cancelled",         val: stats?.cancelled ?? appointments.filter(a=>a.status==="cancelled").length, icon:"❌", col:C.error },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#9bcece; border-radius:10px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.offwhite, fontFamily:F.body }}>

        {/* Topbar */}
        <header style={{ background:C.white, borderBottom:`1px solid ${C.tealMid}`, padding:"0 5%",
          height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:50 }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:"9px", textDecoration:"none" }}>
            <div style={{ width:"32px", height:"32px", background:C.teal, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width:"18px", height:"18px" }}>
                <rect x="10" y="3" width="4" height="18" rx="2" fill="white"/>
                <rect x="3" y="10" width="18" height="4" rx="2" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily:F.display, fontSize:"18px", fontWeight:"700", color:C.teal }}>MediCare</span>
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"12px", background:"#fff8e8", color:"#b45309", border:"1px solid #fcd34d", padding:"3px 10px", borderRadius:"20px", fontWeight:"700" }}>🩺 Doctor</span>
            <div style={{ fontSize:"13px", color:C.textMid }}>👋 <strong>{user?.name}</strong></div>
            <button onClick={handleLogout} style={{ padding:"7px 16px", background:C.errorFaint, color:C.error, border:`1px solid #f5b8b8`, borderRadius:"8px", fontSize:"12px", fontWeight:"700", cursor:"pointer" }}>Logout</button>
          </div>
        </header>

        <main style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 5%" }}>

          {/* Page header */}
          <div style={{ marginBottom:"28px", animation:"fadeUp 0.5s ease" }}>
            <h1 style={{ fontFamily:F.display, fontSize:"28px", fontWeight:"700", color:C.text, marginBottom:"4px" }}>Doctor Dashboard</h1>
            <p style={{ fontSize:"13px", color:C.textLight }}>Manage your appointments and availability</p>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"28px", animation:"fadeUp 0.6s ease" }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background:C.white, borderRadius:"14px", padding:"18px", border:`1.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:"22px", marginBottom:"8px" }}>{s.icon}</div>
                <div style={{ fontSize:"26px", fontWeight:"700", color:s.col, fontFamily:F.display }}>{s.val}</div>
                <div style={{ fontSize:"12px", color:C.textLight, marginTop:"2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Panel switcher */}
          <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
            {[["appointments","📋 Appointments"],["availability","📅 My Availability"]].map(([key,label]) => (
              <button key={key} onClick={() => setActivePanel(key)}
                style={{ padding:"10px 20px", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                  cursor:"pointer", fontFamily:F.body, transition:"all 0.2s",
                  background: activePanel === key ? C.teal : C.white,
                  color: activePanel === key ? C.white : C.textMid,
                  border: `1.5px solid ${activePanel === key ? C.teal : C.border}`,
                  boxShadow: activePanel === key ? "0 4px 14px rgba(11,110,110,0.22)" : "none" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Appointments panel */}
          {activePanel === "appointments" && (
            <div style={{ background:C.white, borderRadius:"16px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden", animation:"fadeUp 0.5s ease" }}>
              {/* Tab bar */}
              <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, padding:"0 16px" }}>
                {[["today","Today"],["upcoming","Upcoming"],["completed","Completed"],["all","All"]].map(([key,label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    style={{ padding:"14px 16px", background:"none", border:"none",
                      borderBottom: activeTab === key ? `2px solid ${C.teal}` : "2px solid transparent",
                      color: activeTab === key ? C.teal : C.textLight,
                      fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
                    {label}
                    <span style={{ marginLeft:"6px", background: activeTab === key ? C.tealFaint : C.offwhite,
                      color: activeTab === key ? C.teal : C.textLight,
                      fontSize:"10px", fontWeight:"700", padding:"1px 6px", borderRadius:"10px" }}>
                      {appointments.filter(a => {
                        const d = new Date(a.date);
                        if (key === "today") return d >= todayStart && d <= todayEnd;
                        if (key === "upcoming") return d > todayEnd && a.status !== "cancelled";
                        if (key === "completed") return a.status === "completed";
                        return true;
                      }).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
                gap:"12px", padding:"10px 16px", background:C.tealFaint,
                borderBottom:`1px solid ${C.tealMid}` }}>
                {["Patient","Date","Time","Status","Actions"].map(h => (
                  <div key={h} style={{ fontSize:"11px", fontWeight:"700", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</div>
                ))}
              </div>

              {loading ? <Spinner /> : filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                  <p style={{ fontSize:"14px", color:C.textLight }}>No appointments for this filter.</p>
                </div>
              ) : (
                filtered.map(appt => (
                  <AppointmentRow key={appt._id} appt={appt} onStatusChange={fetchData} />
                ))
              )}
            </div>
          )}

          {/* Availability panel */}
          {activePanel === "availability" && (
            <div style={{ background:C.white, borderRadius:"16px", border:`1px solid ${C.border}`, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", animation:"fadeUp 0.5s ease" }}>
              <h3 style={{ fontFamily:F.display, fontSize:"20px", color:C.text, marginBottom:"6px" }}>Manage Availability</h3>
              <p style={{ fontSize:"13px", color:C.textLight, marginBottom:"20px" }}>Toggle days and select your available time slots.</p>
              <AvailabilityManager doctorId={user?._id} onSaved={(msg) => showToast(msg)} />
            </div>
          )}
        </main>
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}