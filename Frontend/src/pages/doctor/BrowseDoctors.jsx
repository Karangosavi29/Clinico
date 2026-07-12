import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllDoctors } from "../../api/doctorApi";

const C = {
  teal:"#0B6E6E",tealDark:"#085252",tealDeep:"#063d3d",tealLight:"#14a8a8",
  tealFaint:"#f0fafa",tealMid:"#d4eeee",text:"#1a2e2e",textMid:"#3d6060",
  textLight:"#6a9090",white:"#ffffff",offwhite:"#f7fbfb",border:"#d4e9e9",
  error:"#c0392b",errorFaint:"#fff1f0",
  gold:"#f59e0b",
};
const F = { display:"'Playfair Display', serif", body:"'DM Sans', sans-serif" };

const SPECS = [
  "All Specializations","Cardiologist","Neurologist","Pediatrician",
  "Orthopedist","Dermatologist","Psychiatrist","Gynecologist","General Physician",
];

function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}>
      <div style={{ width:"40px", height:"40px", border:`3px solid ${C.tealMid}`,
        borderTopColor:C.teal, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ color:C.gold, fontSize:"13px", letterSpacing:"1px" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function DoctorCard({ doc }) {
  const [hov, setHov] = useState(false);
  const name = doc.userId?.name || "Doctor";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const avDays = (doc.availability || []).map(a => a.day.slice(0,3)).join(", ") || "Not set";

  return (
    <Link to={`/doctors/${doc._id}`} style={{ textDecoration:"none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background:C.white, borderRadius:"18px", padding:"24px",
          border:`1.5px solid ${hov ? C.teal : C.border}`,
          boxShadow: hov ? "0 12px 40px rgba(11,110,110,0.13)" : "0 2px 10px rgba(0,0,0,0.04)",
          transition:"all 0.25s", transform: hov ? "translateY(-4px)" : "none",
          cursor:"pointer", display:"flex", flexDirection:"column", gap:"14px",
        }}>

        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg,${C.teal},${C.tealLight})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"18px", fontWeight:"700", color:C.white, fontFamily:F.display }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:"15px", fontWeight:"700", color:C.text,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
            <div style={{ fontSize:"12px", color:C.teal, fontWeight:"600", marginTop:"2px" }}>
              🩺 {doc.specialization}
            </div>
          </div>
          {/* Rating pill */}
          <div style={{ background:C.tealFaint, border:`1px solid ${C.tealMid}`,
            borderRadius:"20px", padding:"3px 9px", flexShrink:0,
            fontSize:"12px", fontWeight:"700", color:C.teal }}>
            ⭐ {doc.avgRating ? doc.avgRating.toFixed(1) : "New"}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          <div style={{ background:C.tealFaint, borderRadius:"9px", padding:"8px 10px" }}>
            <div style={{ fontSize:"10px", color:C.textLight, textTransform:"uppercase",
              letterSpacing:"0.06em", marginBottom:"2px" }}>Experience</div>
            <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>
              {doc.experience} years
            </div>
          </div>
          <div style={{ background:C.tealFaint, borderRadius:"9px", padding:"8px 10px" }}>
            <div style={{ fontSize:"10px", color:C.textLight, textTransform:"uppercase",
              letterSpacing:"0.06em", marginBottom:"2px" }}>Reviews</div>
            <div style={{ fontSize:"13px", fontWeight:"700", color:C.text }}>
              {doc.reviewCount || 0} reviews
            </div>
          </div>
        </div>

        {/* Available days */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:"12px",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"11px", color:C.textLight }}>
            📅 {avDays}
          </div>
          <div style={{
            fontSize:"12px", fontWeight:"700", color: hov ? C.white : C.teal,
            background: hov ? C.teal : C.tealFaint,
            border:`1px solid ${C.tealMid}`, borderRadius:"8px",
            padding:"5px 12px", transition:"all 0.2s",
          }}>
            View Profile →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseDoctors() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All Specializations");
  const [sortBy, setSortBy] = useState("rating"); // rating | experience | reviews

  useEffect(() => {
    getAllDoctors()
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  // Filter + sort
  const filtered = doctors
    .filter(d => {
      const name = d.userId?.name?.toLowerCase() || "";
      const spec = d.specialization?.toLowerCase() || "";
      const q    = search.toLowerCase();
      const matchSearch = !search || name.includes(q) || spec.includes(q);
      const matchSpec   = specFilter === "All Specializations" || d.specialization === specFilter;
      return matchSearch && matchSpec;
    })
    .sort((a, b) => {
      if (sortBy === "rating")     return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === "experience") return (b.experience || 0) - (a.experience || 0);
      if (sortBy === "reviews")    return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0;
    });

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

        {/* Navbar */}
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
            {user ? (
              <>
                <span style={{ fontSize:"13px", color:C.textMid, fontWeight:"600" }}>👋 {user.name}</span>
                <Link to={`/${user.role}`} style={{ padding:"7px 14px", background:C.tealFaint,
                  color:C.teal, border:`1.5px solid ${C.tealMid}`, borderRadius:"8px",
                  fontSize:"13px", fontWeight:"600", textDecoration:"none" }}>Dashboard</Link>
                <button onClick={handleLogout} style={{ padding:"7px 14px", background:"#fff1f0",
                  color:C.error, border:"1px solid #f5b8b8", borderRadius:"8px",
                  fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding:"7px 16px", background:C.white, color:C.teal,
                  border:`1.5px solid ${C.teal}`, borderRadius:"8px", fontSize:"13px",
                  fontWeight:"700", textDecoration:"none" }}>Sign In</Link>
                <Link to="/signup" style={{ padding:"7px 16px", background:C.teal, color:C.white,
                  border:"none", borderRadius:"8px", fontSize:"13px",
                  fontWeight:"700", textDecoration:"none" }}>Sign Up</Link>
              </>
            )}
          </div>
        </header>

        {/* Hero strip */}
        <div style={{ background:`linear-gradient(135deg,${C.tealDeep},${C.tealDark})`,
          padding:"40px 5%", textAlign:"center" }}>
          <div style={{ maxWidth:"600px", margin:"0 auto" }}>
            <h1 style={{ fontFamily:F.display, fontSize:"clamp(22px,3vw,34px)", fontWeight:"700",
              color:C.white, marginBottom:"10px" }}>
              Find the Right Doctor
            </h1>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)", marginBottom:"22px" }}>
              Browse {doctors.length} verified specialists. Click any doctor to view their profile and book.
            </p>
            {/* Search bar */}
            <div style={{ position:"relative", maxWidth:"460px", margin:"0 auto" }}>
              <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)",
                fontSize:"16px", pointerEvents:"none" }}>🔍</span>
              <input
                type="text" placeholder="Search by name or specialization…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%", padding:"13px 14px 13px 42px",
                  borderRadius:"12px", border:"none", fontSize:"14px",
                  fontFamily:F.body, color:C.text, outline:"none",
                  boxShadow:"0 4px 18px rgba(0,0,0,0.14)", boxSizing:"border-box" }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`,
          padding:"14px 5%", display:"flex", gap:"12px", alignItems:"center",
          flexWrap:"wrap", position:"sticky", top:"62px", zIndex:40 }}>
          {/* Specialization filter */}
          <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
            style={{ padding:"8px 14px", borderRadius:"9px", border:`1.5px solid ${C.border}`,
              fontSize:"13px", fontFamily:F.body, color:C.text, background:C.white,
              cursor:"pointer", outline:"none" }}>
            {SPECS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <div style={{ display:"flex", gap:"6px", marginLeft:"auto" }}>
            <span style={{ fontSize:"12px", color:C.textLight, alignSelf:"center" }}>Sort by:</span>
            {[["rating","⭐ Rating"],["experience","📅 Experience"],["reviews","💬 Reviews"]].map(([key,label]) => (
              <button key={key} onClick={() => setSortBy(key)}
                style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"700",
                  cursor:"pointer", fontFamily:F.body, transition:"all 0.15s",
                  background: sortBy === key ? C.teal : C.tealFaint,
                  color: sortBy === key ? C.white : C.textMid,
                  border: `1px solid ${sortBy === key ? C.teal : C.border}` }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <main style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 5% 60px" }}>
          {/* Count */}
          <div style={{ marginBottom:"20px", fontSize:"13px", color:C.textLight, animation:"fadeUp 0.4s ease" }}>
            Showing <strong style={{ color:C.text }}>{filtered.length}</strong> doctor{filtered.length !== 1 ? "s" : ""}
            {specFilter !== "All Specializations" && ` in ${specFilter}`}
            {search && ` matching "${search}"`}
          </div>

          {loading ? <Spinner /> : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 24px", animation:"fadeUp 0.4s ease" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔍</div>
              <h3 style={{ fontFamily:F.display, fontSize:"22px", color:C.text, marginBottom:"8px" }}>
                No doctors found
              </h3>
              <p style={{ fontSize:"14px", color:C.textLight }}>
                Try a different search term or specialization.
              </p>
              <button onClick={() => { setSearch(""); setSpecFilter("All Specializations"); }}
                style={{ marginTop:"16px", padding:"10px 22px", background:C.teal, color:C.white,
                  border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                  cursor:"pointer", fontFamily:F.body }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
              gap:"20px", animation:"fadeUp 0.5s ease" }}>
              {filtered.map(doc => <DoctorCard key={doc._id} doc={doc} />)}
            </div>
          )}
        </main>
      </div>
    </>
  );
}