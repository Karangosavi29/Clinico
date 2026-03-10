import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAppointments } from "../../api/appointmentApi";
import { approveAppointment, cancelAppointmentAdmin } from "../../api/appointmentApi";
import { getAllDoctors, deleteDoctor } from "../../api/doctorApi";

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
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)", display:"flex", gap:"10px", alignItems:"center" }}>
      {type === "error" ? "⚠" : "✓"} {msg}
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:s.color, fontSize:"16px" }}>×</button>
    </div>
  );
}

/* ── Appointment Row ── */
function AppointmentRow({ appt, onAction }) {
  const [loading, setLoading] = useState(false);
  const patientName = appt.patientId?.name || "Patient";
  const doctorName  = appt.doctorId?.userId?.name || appt.doctorId?.name || "Doctor";
  const doctorSpec  = appt.doctorId?.specialization || "—";

  const handle = async (action) => {
    setLoading(true);
    try {
      if (action === "approve") await approveAppointment(appt._id);
      if (action === "cancel")  await cancelAppointmentAdmin(appt._id);
      onAction();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1.8fr 1fr 1fr 1fr auto",
      gap:"10px", alignItems:"center", padding:"13px 16px",
      borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = C.tealFaint}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {/* Patient */}
      <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
        <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:`linear-gradient(135deg,#2a6090,#4a90c0)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", color:C.white, flexShrink:0 }}>
          {patientName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>{patientName}</div>
          <div style={{ fontSize:"11px", color:C.textLight }}>{appt.patientId?.email || "—"}</div>
        </div>
      </div>
      {/* Doctor */}
      <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
        <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:`linear-gradient(135deg,${C.teal},${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", color:C.white, flexShrink:0 }}>
          {doctorName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>{doctorName}</div>
          <div style={{ fontSize:"11px", color:C.teal, fontWeight:"600" }}>{doctorSpec}</div>
        </div>
      </div>
      {/* Date */}
      <div style={{ fontSize:"13px", color:C.text }}>
        {new Date(appt.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}
      </div>
      {/* Time */}
      <div style={{ fontSize:"13px", color:C.text }}>🕐 {appt.timeSlot}</div>
      {/* Status */}
      <StatusBadge status={appt.status} />
      {/* Actions */}
      <div style={{ display:"flex", gap:"5px" }}>
        {appt.status === "pending" && (
          <button onClick={() => handle("approve")} disabled={loading}
            style={{ padding:"5px 10px", background:C.successFaint, color:C.success,
              border:`1px solid #86d4ad`, borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
            ✓ Approve
          </button>
        )}
        {appt.status !== "cancelled" && appt.status !== "completed" && (
          <button onClick={() => handle("cancel")} disabled={loading}
            style={{ padding:"5px 10px", background:C.errorFaint, color:C.error,
              border:`1px solid #f5b8b8`, borderRadius:"7px", fontSize:"11px",
              fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
            ✕ Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Doctor Management Row ── */
function DoctorRow({ doc, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const name = doc.userId?.name || "—";
  const email = doc.userId?.email || "—";

  const handleDelete = async () => {
    if (!window.confirm(`Remove Dr. ${name} from the platform?`)) return;
    setLoading(true);
    try {
      await deleteDoctor(doc._id);
      onDeleted();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1fr 1fr auto",
      gap:"12px", alignItems:"center", padding:"13px 16px",
      borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = C.tealFaint}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:`linear-gradient(135deg,${C.teal},${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:C.white, flexShrink:0 }}>
          {name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>{name}</div>
          <div style={{ fontSize:"11px", color:C.textLight }}>{email}</div>
        </div>
      </div>
      <div style={{ fontSize:"13px", color:C.teal, fontWeight:"600" }}>{doc.specialization}</div>
      <div style={{ fontSize:"13px", color:C.textMid }}>{doc.experience} yrs</div>
      <div>
        <div style={{ fontSize:"12px", fontWeight:"600", color:C.text }}>
          ⭐ {doc.avgRating?.toFixed(1) || "—"}
          <span style={{ color:C.textLight, fontWeight:"400" }}> ({doc.reviewCount || 0})</span>
        </div>
      </div>
      <button onClick={handleDelete} disabled={loading}
        style={{ padding:"6px 12px", background:C.errorFaint, color:C.error,
          border:`1px solid #f5b8b8`, borderRadius:"8px", fontSize:"11px",
          fontWeight:"700", cursor:"pointer", fontFamily:F.body }}>
        {loading ? "…" : "Remove"}
      </button>
    </div>
  );
}

/* ── AdminDashboard ── */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState("overview"); // overview | appointments | doctors
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, docs] = await Promise.all([
        getAppointments({ limit:200 }),
        getAllDoctors(),
      ]);
      setAppointments(Array.isArray(appts) ? appts : []);
      setDoctors(Array.isArray(docs) ? docs : []);
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  // Stats
  const total     = appointments.length;
  const pending   = appointments.filter(a => a.status === "pending").length;
  const approved  = appointments.filter(a => a.status === "approved").length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  // Filtered appointments
  const filteredAppts = statusFilter === "all"
    ? appointments
    : appointments.filter(a => a.status === statusFilter);

  const overviewStats = [
    { label:"Total Appointments", val:total,     icon:"📋", col:C.teal },
    { label:"Pending Approval",   val:pending,   icon:"⏳", col:"#b45309" },
    { label:"Approved",           val:approved,  icon:"✅", col:C.success },
    { label:"Total Doctors",      val:doctors.length, icon:"🩺", col:"#1d4ed8" },
    { label:"Completed",          val:completed, icon:"🏁", col:"#6d28d9" },
    { label:"Cancelled",          val:cancelled, icon:"❌", col:C.error },
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
            <span style={{ fontSize:"12px", background:"#f5f3ff", color:"#6d28d9", border:"1px solid #c4b5fd", padding:"3px 10px", borderRadius:"20px", fontWeight:"700" }}>⚙ Admin</span>
            <div style={{ fontSize:"13px", color:C.textMid }}>👋 <strong>{user?.name}</strong></div>
            <button onClick={handleLogout} style={{ padding:"7px 16px", background:C.errorFaint, color:C.error, border:`1px solid #f5b8b8`, borderRadius:"8px", fontSize:"12px", fontWeight:"700", cursor:"pointer" }}>Logout</button>
          </div>
        </header>

        <main style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 5%" }}>

          {/* Page header */}
          <div style={{ marginBottom:"28px", animation:"fadeUp 0.5s ease" }}>
            <h1 style={{ fontFamily:F.display, fontSize:"28px", fontWeight:"700", color:C.text, marginBottom:"4px" }}>Admin Dashboard</h1>
            <p style={{ fontSize:"13px", color:C.textLight }}>Platform overview — manage appointments and doctors</p>
          </div>

          {/* Overview stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"14px", marginBottom:"28px", animation:"fadeUp 0.6s ease" }}>
            {overviewStats.map(s => (
              <div key={s.label} style={{ background:C.white, borderRadius:"14px", padding:"16px", border:`1.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:"20px", marginBottom:"6px" }}>{s.icon}</div>
                <div style={{ fontSize:"22px", fontWeight:"700", color:s.col, fontFamily:F.display }}>{s.val}</div>
                <div style={{ fontSize:"11px", color:C.textLight, marginTop:"2px", lineHeight:"1.4" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Panel switcher */}
          <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
            {[["appointments","📋 Appointments"],["doctors","🩺 Doctors"]].map(([key,label]) => (
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

          {/* ── Appointments Panel ── */}
          {activePanel === "appointments" && (
            <div style={{ background:C.white, borderRadius:"16px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden", animation:"fadeUp 0.5s ease" }}>
              {/* Filters */}
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {["all","pending","approved","booked","completed","cancelled"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{ padding:"6px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:"700",
                      cursor:"pointer", fontFamily:F.body, transition:"all 0.15s",
                      background: statusFilter === s ? C.teal : C.tealFaint,
                      color: statusFilter === s ? C.white : C.textMid,
                      border: `1px solid ${statusFilter === s ? C.teal : C.border}` }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s !== "all" && (
                      <span style={{ marginLeft:"5px", opacity:0.8 }}>
                        ({appointments.filter(a => a.status === s).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1.8fr 1fr 1fr 1fr auto",
                gap:"10px", padding:"10px 16px", background:C.tealFaint, borderBottom:`1px solid ${C.tealMid}` }}>
                {["Patient","Doctor","Date","Time","Status","Actions"].map(h => (
                  <div key={h} style={{ fontSize:"11px", fontWeight:"700", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</div>
                ))}
              </div>

              {loading ? <Spinner /> : filteredAppts.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                  <p style={{ fontSize:"14px", color:C.textLight }}>No appointments found.</p>
                </div>
              ) : (
                filteredAppts.map(appt => (
                  <AppointmentRow key={appt._id} appt={appt} onAction={() => { fetchData(); showToast("Appointment updated"); }} />
                ))
              )}
            </div>
          )}

          {/* ── Doctors Panel ── */}
          {activePanel === "doctors" && (
            <div style={{ background:C.white, borderRadius:"16px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden", animation:"fadeUp 0.5s ease" }}>
              {/* Header */}
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <h3 style={{ fontFamily:F.display, fontSize:"18px", color:C.text, marginBottom:"2px" }}>Registered Doctors</h3>
                  <p style={{ fontSize:"12px", color:C.textLight }}>{doctors.length} doctors on the platform</p>
                </div>
              </div>

              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1fr 1fr auto",
                gap:"12px", padding:"10px 16px", background:C.tealFaint, borderBottom:`1px solid ${C.tealMid}` }}>
                {["Doctor","Specialization","Experience","Rating","Action"].map(h => (
                  <div key={h} style={{ fontSize:"11px", fontWeight:"700", color:C.textLight, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</div>
                ))}
              </div>

              {loading ? <Spinner /> : doctors.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>👨‍⚕️</div>
                  <p style={{ fontSize:"14px", color:C.textLight }}>No doctors registered yet.</p>
                </div>
              ) : (
                doctors.map(doc => (
                  <DoctorRow key={doc._id} doc={doc} onDeleted={() => { fetchData(); showToast("Doctor removed"); }} />
                ))
              )}
            </div>
          )}
        </main>
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}