import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getSingleDoctor, getDoctorAvailability } from "../../api/doctorApi";
import { getDoctorReviews, addReview } from "../../api/reviewApi";
import { bookAppointment } from "../../api/appointmentApi";

/* ── tokens ── */
const C = {
  teal:"#0B6E6E", tealDark:"#085252", tealDeep:"#063d3d", tealLight:"#14a8a8",
  tealFaint:"#f0fafa", tealMid:"#d4eeee", text:"#1a2e2e", textMid:"#3d6060",
  textLight:"#6a9090", white:"#ffffff", offwhite:"#f7fbfb", border:"#d4e9e9",
  error:"#c0392b", errorFaint:"#fff1f0", success:"#1a7a52", successFaint:"#f0faf5",
  gold:"#f59e0b",
};
const F = { display:"'Playfair Display', serif", body:"'DM Sans', sans-serif" };

/* ── helpers ── */
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

/* ── Star rating display ── */
function Stars({ rating, size = 14, interactive = false, onRate }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display:"flex", gap:"2px" }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => interactive && onRate && onRate(n)}
          onMouseEnter={() => interactive && setHov(n)}
          onMouseLeave={() => interactive && setHov(0)}
          style={{
            fontSize: size, cursor: interactive ? "pointer" : "default",
            color: n <= (hov || rating) ? C.gold : "#d4e0e0",
            transition:"color 0.1s",
          }}>★</span>
      ))}
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}>
      <div style={{ width:"40px", height:"40px", border:`3px solid ${C.tealMid}`,
        borderTopColor:C.teal, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const s = type === "error"
    ? { bg:C.errorFaint, border:"#f5b8b8", color:C.error }
    : { bg:C.successFaint, border:"#86d4ad", color:C.success };
  return (
    <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:999,
      background:s.bg, border:`1px solid ${s.border}`, color:s.color,
      padding:"12px 18px", borderRadius:"12px", fontSize:"13px", fontFamily:F.body,
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)", display:"flex", gap:"10px", alignItems:"center",
      animation:"slideUp 0.3s ease" }}>
      {type === "error" ? "⚠" : "✓"} {msg}
      <button onClick={onClose} style={{ background:"none", border:"none",
        cursor:"pointer", color:s.color, fontSize:"16px", lineHeight:1 }}>×</button>
    </div>
  );
}

/* ── Book Appointment Modal ── */
function BookModal({ doctor, onClose, onBooked }) {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({ date:"", timeSlot:"", notes:"" });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctorAvailability(doctor._id)
      .then(setAvailability)
      .catch(() => setAvailability([]));
  }, [doctor._id]);

  const handleDateChange = (date) => {
    setForm(f => ({ ...f, date, timeSlot:"" }));
    const day = new Date(date).toLocaleString("en-US", { weekday:"long" });
    const dayAvail = availability.find(a => a.day === day);
    setSlots(dayAvail?.slots || []);
  };

  const handleBook = async () => {
    if (!form.date || !form.timeSlot) { setError("Please select a date and time slot"); return; }
    setLoading(true); setError("");
    try {
      await bookAppointment({ doctorId: doctor._id, date: form.date, timeSlot: form.timeSlot, notes: form.notes });
      onBooked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  const doctorName = doctor.userId?.name || "Doctor";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(6,61,61,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"22px", width:"100%", maxWidth:"460px",
        boxShadow:"0 24px 64px rgba(0,0,0,0.22)", animation:"slideUp 0.3s ease" }}>
        {/* Header */}
        <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ fontFamily:F.display, fontSize:"21px", color:C.text, marginBottom:"3px" }}>Book Appointment</h3>
            <p style={{ fontSize:"12px", color:C.textLight }}>with {doctorName} · {doctor.specialization}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px",
            cursor:"pointer", color:C.textLight, lineHeight:1 }}>×</button>
        </div>

        <div style={{ padding:"20px 28px 28px" }}>
          {error && (
            <div style={{ padding:"10px 14px", borderRadius:"9px", marginBottom:"14px",
              background:C.errorFaint, border:"1px solid #f5b8b8", color:C.error, fontSize:"13px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Date */}
          <div style={{ marginBottom:"16px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>Select Date *</label>
            <input type="date" value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => handleDateChange(e.target.value)}
              style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`,
                borderRadius:"10px", fontSize:"14px", fontFamily:F.body, color:C.text,
                background:C.tealFaint, outline:"none", boxSizing:"border-box" }} />
          </div>

          {/* Time slots */}
          {form.date && (
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"8px" }}>
                Available Slots — {new Date(form.date).toLocaleString("en-US", { weekday:"long" })}
              </label>
              {slots.length === 0 ? (
                <div style={{ padding:"12px", background:C.errorFaint, borderRadius:"9px",
                  color:C.error, fontSize:"13px", textAlign:"center" }}>
                  No slots available on this day
                </div>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {slots.map(slot => (
                    <button key={slot} type="button"
                      onClick={() => setForm(f => ({ ...f, timeSlot: slot }))}
                      style={{ padding:"8px 14px", borderRadius:"8px", fontSize:"13px",
                        fontWeight:"600", cursor:"pointer", fontFamily:F.body, transition:"all 0.15s",
                        background: form.timeSlot === slot ? C.teal : C.white,
                        color: form.timeSlot === slot ? C.white : C.teal,
                        border:`1.5px solid ${form.timeSlot === slot ? C.teal : C.border}` }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom:"20px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>
              Notes (optional)
            </label>
            <textarea value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
              boxShadow:"0 4px 18px rgba(11,110,110,0.25)", display:"flex",
              alignItems:"center", justifyContent:"center", gap:"8px" }}>
            {loading && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.4)",
              borderTopColor:C.white, borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />}
            {loading ? "Booking…" : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Review Card ── */
function ReviewCard({ review }) {
  const name    = review.patientId?.name || "Anonymous";
  const date    = fmtDate(review.createdAt);

  return (
    <div style={{ background:C.white, borderRadius:"14px", padding:"20px",
      border:`1.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg, #2a6090, #4a90c0)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"13px", fontWeight:"700", color:C.white }}>
            {initials(name)}
          </div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:"700", color:C.text }}>{name}</div>
            <div style={{ fontSize:"11px", color:C.textLight }}>{date}</div>
          </div>
        </div>
        <Stars rating={review.rating} size={15} />
      </div>
      {review.comment && (
        <p style={{ fontSize:"13px", color:C.textMid, lineHeight:"1.7",
          fontStyle:"italic", paddingLeft:"51px" }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

/* ── Write Review Form ── */
function ReviewForm({ doctorId, onReviewed }) {
  const [form, setForm] = useState({ rating: 0, comment:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.rating) { setError("Please select a star rating"); return; }
    setLoading(true); setError("");
    try {
      await addReview({ doctorId, rating: form.rating, comment: form.comment });
      setSuccess(true);
      onReviewed();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{ textAlign:"center", padding:"24px", background:C.successFaint,
        border:`1px solid #86d4ad`, borderRadius:"14px" }}>
        <div style={{ fontSize:"28px", marginBottom:"8px" }}>⭐</div>
        <div style={{ fontSize:"14px", fontWeight:"700", color:C.success }}>Review submitted! Thank you.</div>
      </div>
    );
  }

  return (
    <div style={{ background:C.tealFaint, borderRadius:"14px", padding:"22px",
      border:`1.5px solid ${C.tealMid}` }}>
      <h4 style={{ fontFamily:F.display, fontSize:"17px", color:C.text, marginBottom:"14px" }}>
        Write a Review
      </h4>

      {error && (
        <div style={{ padding:"9px 12px", borderRadius:"8px", marginBottom:"12px",
          background:C.errorFaint, border:"1px solid #f5b8b8", color:C.error, fontSize:"13px" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ marginBottom:"14px" }}>
        <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"8px" }}>
          Your Rating *
        </label>
        <Stars rating={form.rating} size={28} interactive onRate={n => setForm(f => ({ ...f, rating: n }))} />
        {form.rating > 0 && (
          <div style={{ fontSize:"12px", color:C.teal, marginTop:"5px", fontWeight:"600" }}>
            {["","Poor","Fair","Good","Very Good","Excellent"][form.rating]}
          </div>
        )}
      </div>

      <div style={{ marginBottom:"16px" }}>
        <label style={{ display:"block", fontSize:"11px", fontWeight:"700", color:C.textLight,
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>
          Comment (optional)
        </label>
        <textarea value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          placeholder="Share your experience with this doctor…"
          rows={3}
          style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`,
            borderRadius:"10px", fontSize:"14px", fontFamily:F.body, color:C.text,
            background:C.white, outline:"none", resize:"vertical", boxSizing:"border-box" }} />
      </div>

      <button onClick={handleSubmit} disabled={loading}
        style={{ width:"100%", padding:"12px", background: loading ? "#6aadad" : C.teal,
          color:C.white, border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:"700",
          fontFamily:F.body, cursor: loading ? "not-allowed" : "pointer",
          boxShadow:"0 4px 14px rgba(11,110,110,0.2)" }}>
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}

/* ── DoctorProfile ── */
export default function DoctorProfile() {
  const { id }           = useParams();
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const [doctor, setDoctor]   = useState(null);
  const [reviewData, setReviewData] = useState({ reviews:[], avgRating:0 });
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [toast, setToast]     = useState(null);

  const isPatient = user?.role === "patient";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [doc, revData] = await Promise.all([
        getSingleDoctor(id),
        getDoctorReviews(id),
      ]);
      setDoctor(doc);
      setReviewData(revData || { reviews:[], avgRating:0 });
    } catch {
      navigate("/");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
      <div style={{ minHeight:"100vh", background:C.offwhite, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Spinner />
      </div>
    </>
  );

  if (!doctor) return null;

  const name         = doctor.userId?.name || "Doctor";
  const email        = doctor.userId?.email || "—";
  const avgRating    = reviewData.avgRating || 0;
  const reviews      = reviewData.reviews   || [];
  const availability = doctor.availability  || [];

  /* rating bar widths */
  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#9bcece; border-radius:10px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:C.offwhite, fontFamily:F.body }}>

        {/* ── Navbar ── */}
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
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <button onClick={() => navigate(-1)}
              style={{ padding:"7px 16px", background:C.white, color:C.textMid,
                border:`1.5px solid ${C.border}`, borderRadius:"8px", fontSize:"13px",
                fontWeight:"600", cursor:"pointer", fontFamily:F.body }}>
              ← Back
            </button>
            {user ? (
              <Link to={`/${user.role}`} style={{ padding:"7px 16px", background:C.tealFaint,
                color:C.teal, border:`1.5px solid ${C.tealMid}`, borderRadius:"8px",
                fontSize:"13px", fontWeight:"600", textDecoration:"none" }}>
                Dashboard
              </Link>
            ) : (
              <Link to="/login" style={{ padding:"7px 16px", background:C.teal, color:C.white,
                border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700",
                textDecoration:"none" }}>Sign In</Link>
            )}
          </div>
        </header>

        {/* ── Hero Banner ── */}
        <div style={{
          background:`linear-gradient(140deg, ${C.tealDeep} 0%, ${C.tealDark} 55%, #0d5c5c 100%)`,
          padding:"48px 5% 0",
        }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex",
            alignItems:"flex-end", gap:"28px", animation:"fadeUp 0.5s ease" }}>
            {/* Avatar */}
            <div style={{ width:"100px", height:"100px", borderRadius:"50%", flexShrink:0,
              background:`linear-gradient(135deg, ${C.tealLight}, #0d9a9a)`,
              border:"4px solid rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"32px", fontWeight:"700", color:C.white, fontFamily:F.display,
              marginBottom:"-20px" }}>
              {initials(name)}
            </div>
            {/* Info */}
            <div style={{ paddingBottom:"28px", flex:1 }}>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.55)", marginBottom:"6px",
                textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:"700" }}>
                Verified Doctor
              </div>
              <h1 style={{ fontFamily:F.display, fontSize:"clamp(24px,3vw,34px)",
                fontWeight:"700", color:C.white, marginBottom:"6px" }}>{name}</h1>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"center" }}>
                <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)",
                  background:"rgba(255,255,255,0.1)", padding:"3px 12px", borderRadius:"20px",
                  border:"1px solid rgba(255,255,255,0.15)" }}>
                  🩺 {doctor.specialization}
                </span>
                <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)" }}>
                  📅 {doctor.experience} yrs experience
                </span>
                <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)" }}>
                  ✉ {email}
                </span>
              </div>
            </div>
            {/* Rating pill */}
            <div style={{ paddingBottom:"28px", textAlign:"center" }}>
              <div style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
                borderRadius:"14px", padding:"14px 22px", backdropFilter:"blur(8px)" }}>
                <div style={{ fontFamily:F.display, fontSize:"32px", fontWeight:"700", color:C.white, lineHeight:1 }}>
                  {avgRating.toFixed(1)}
                </div>
                <Stars rating={Math.round(avgRating)} size={14} />
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ maxWidth:"1100px", margin:"32px auto 60px", padding:"0 5%",
          display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", animation:"fadeUp 0.6s ease" }}>

          {/* ── Left column ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>

            {/* Availability */}
            <div style={{ background:C.white, borderRadius:"16px", padding:"24px",
              border:`1.5px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily:F.display, fontSize:"19px", color:C.text, marginBottom:"16px" }}>
                📅 Weekly Availability
              </h3>
              {availability.length === 0 ? (
                <p style={{ fontSize:"13px", color:C.textLight }}>No availability set yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {availability.map(({ day, slots }) => (
                    <div key={day} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ width:"100px", fontSize:"13px", fontWeight:"700", color:C.text, flexShrink:0 }}>{day}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                        {slots.map(slot => (
                          <span key={slot} style={{ padding:"4px 10px", background:C.tealFaint,
                            color:C.teal, border:`1px solid ${C.tealMid}`, borderRadius:"7px",
                            fontSize:"12px", fontWeight:"600" }}>
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rating breakdown */}
            <div style={{ background:C.white, borderRadius:"16px", padding:"24px",
              border:`1.5px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily:F.display, fontSize:"19px", color:C.text, marginBottom:"18px" }}>
                ⭐ Rating Breakdown
              </h3>
              <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
                {/* Big number */}
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontFamily:F.display, fontSize:"52px", fontWeight:"700",
                    color:C.text, lineHeight:1, marginBottom:"6px" }}>
                    {avgRating.toFixed(1)}
                  </div>
                  <Stars rating={Math.round(avgRating)} size={18} />
                  <div style={{ fontSize:"12px", color:C.textLight, marginTop:"6px" }}>
                    {reviews.length} reviews
                  </div>
                </div>
                {/* Bars */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"7px" }}>
                  {ratingCounts.map(({ star, count, pct }) => (
                    <div key={star} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"12px", color:C.textLight, width:"14px", textAlign:"right" }}>{star}</span>
                      <span style={{ color:C.gold, fontSize:"12px" }}>★</span>
                      <div style={{ flex:1, height:"7px", background:C.tealFaint, borderRadius:"4px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:C.gold, borderRadius:"4px", transition:"width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize:"11px", color:C.textLight, width:"20px" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div>
              <h3 style={{ fontFamily:F.display, fontSize:"19px", color:C.text, marginBottom:"14px" }}>
                💬 Patient Reviews
              </h3>
              {reviews.length === 0 ? (
                <div style={{ textAlign:"center", padding:"36px", background:C.white,
                  borderRadius:"14px", border:`1.5px solid ${C.border}` }}>
                  <div style={{ fontSize:"36px", marginBottom:"10px" }}>💬</div>
                  <p style={{ fontSize:"14px", color:C.textLight }}>No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {reviews.map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
                </div>
              )}
            </div>

            {/* Write review — patients only */}
            {isPatient && (
              <ReviewForm
                doctorId={doctor._id}
                onReviewed={() => { fetchAll(); showToast("Review submitted!"); }}
              />
            )}
            {!user && (
              <div style={{ background:C.tealFaint, borderRadius:"14px", padding:"20px",
                border:`1.5px solid ${C.tealMid}`, textAlign:"center" }}>
                <p style={{ fontSize:"14px", color:C.textMid, marginBottom:"12px" }}>
                  Sign in as a patient to leave a review or book an appointment.
                </p>
                <Link to="/login" style={{ display:"inline-block", background:C.teal, color:C.white,
                  borderRadius:"10px", padding:"10px 24px", fontSize:"13px", fontWeight:"700",
                  textDecoration:"none" }}>Sign In</Link>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

            {/* Book CTA */}
            <div style={{ background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
              borderRadius:"16px", padding:"24px", boxShadow:"0 8px 28px rgba(11,110,110,0.28)" }}>
              <h3 style={{ fontFamily:F.display, fontSize:"18px", color:C.white, marginBottom:"8px" }}>
                Book an Appointment
              </h3>
              <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)", marginBottom:"16px", lineHeight:"1.6" }}>
                Available for consultations. Select a time that works for you.
              </p>
              {isPatient ? (
                <button onClick={() => setShowBook(true)}
                  style={{ width:"100%", padding:"12px", background:C.white, color:C.teal,
                    border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:"700",
                    cursor:"pointer", fontFamily:F.body, boxShadow:"0 2px 10px rgba(0,0,0,0.12)" }}>
                  📅 Book Now
                </button>
              ) : !user ? (
                <Link to="/login" style={{ display:"block", width:"100%", padding:"12px", background:C.white,
                  color:C.teal, border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:"700",
                  cursor:"pointer", textAlign:"center", textDecoration:"none",
                  boxShadow:"0 2px 10px rgba(0,0,0,0.12)" }}>
                  Sign In to Book
                </Link>
              ) : (
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.65)", textAlign:"center" }}>
                  Only patients can book appointments.
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ background:C.white, borderRadius:"14px", padding:"18px",
              border:`1.5px solid ${C.border}` }}>
              <h4 style={{ fontFamily:F.display, fontSize:"15px", color:C.text, marginBottom:"14px" }}>
                Quick Facts
              </h4>
              {[
                { icon:"🩺", label:"Specialization", val: doctor.specialization },
                { icon:"📅", label:"Experience",     val:`${doctor.experience} years` },
                { icon:"⭐", label:"Rating",         val:`${avgRating.toFixed(1)} / 5.0` },
                { icon:"💬", label:"Total Reviews",  val: reviews.length },
                { icon:"📆", label:"Available Days", val: availability.length > 0
                  ? availability.map(a => a.day.slice(0,3)).join(", ")
                  : "Not set" },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:"13px", color:C.textLight }}>{icon} {label}</span>
                  <span style={{ fontSize:"13px", fontWeight:"700", color:C.text, textAlign:"right", maxWidth:"55%" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Availability days quick view */}
            {availability.length > 0 && (
              <div style={{ background:C.white, borderRadius:"14px", padding:"18px",
                border:`1.5px solid ${C.border}` }}>
                <h4 style={{ fontFamily:F.display, fontSize:"15px", color:C.text, marginBottom:"12px" }}>
                  Available Days
                </h4>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => {
                    const full = { Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday" }[d];
                    const active = availability.some(a => a.day === full);
                    return (
                      <div key={d} style={{ padding:"6px 10px", borderRadius:"8px", fontSize:"12px", fontWeight:"700",
                        background: active ? C.tealFaint : C.offwhite,
                        color: active ? C.teal : "#bcd0d0",
                        border:`1px solid ${active ? C.tealMid : C.border}` }}>
                        {d}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book modal */}
      {showBook && (
        <BookModal
          doctor={doctor}
          onClose={() => setShowBook(false)}
          onBooked={() => showToast("Appointment booked successfully!")}
        />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}