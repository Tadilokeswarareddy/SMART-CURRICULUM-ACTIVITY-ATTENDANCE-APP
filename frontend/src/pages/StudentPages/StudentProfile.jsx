import React, { useState, useEffect } from "react"
import StudentNav from "../../components/StudentNav"
import api from "../../api"

const G = {
  50:  "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
}

const StudentProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/profile/student/")
      .then((res) => { setProfile(res.data); setLoading(false) })
      .catch(() => { setError("Failed to load profile"); setLoading(false) })
  }, [])

  if (loading) return (
    <>
      <StudentNav />
      <div style={s.centered}>
        <div style={s.spinRing}><div style={s.spinArc} /></div>
        <p style={{ color: G[600], marginTop: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Loading profile…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )

  if (error) return (
    <>
      <StudentNav />
      <div style={{ ...s.centered, color: "#dc2626" }}>{error}</div>
    </>
  )

  return (
    <>
      <StudentNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp-field:hover {
          border-color: ${G[400]} !important;
          box-shadow: 0 0 0 3px ${G[100]} !important;
        }
      `}</style>

      <div style={s.page}>

        {/* ── Banner ── */}
        <div style={s.banner}>
          <div style={s.c1} /><div style={s.c2} /><div style={s.c3} />

          <div style={s.bannerInner}>
            <div style={{ position: "relative", animation: "fadeUp 0.45s ease both" }}>
              {profile.profile_picture
                ? <img src={profile.profile_picture} alt="Profile" style={s.avatarImg} />
                : <div style={s.avatarFallback}>{profile.full_name?.charAt(0).toUpperCase()}</div>
              }
              <div style={s.avatarGlow} />
            </div>

            <div style={{ animation: "fadeUp 0.45s ease both", animationDelay: "0.08s" }}>
              <span style={s.roleTag}>Student</span>
              <h1 style={s.heroName}>{profile.full_name}</h1>
              <span style={s.pill}>{profile.roll_number}</span>
            </div>
          </div>

          <svg style={s.wave} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]} />
          </svg>
        </div>

        {/* ── Card ── */}
        <div style={s.body}>
          <div style={{ ...s.card, animation: "fadeUp 0.5s ease both", animationDelay: "0.2s" }}>
            <Heading label="Student Details" />
            <div style={s.grid}>
              <Field label="Full Name"    value={profile.full_name} />
              <Field label="Username"     value={profile.username} />
              <Field label="Phone Number" value={profile.phone_number} />
              <Field label="Email"        value={profile.email} />
              <Field label="Roll Number"  value={profile.roll_number} />
              <Field label="Section"      value={profile.section} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const Heading = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
    <div style={{ width: 3, height: 20, borderRadius: 2, background: `linear-gradient(to bottom, ${G[500]}, ${G[300]})`, flexShrink: 0 }} />
    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G[800], fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.1px" }}>{label}</h2>
  </div>
)

const Field = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 10, fontWeight: 700, color: G[600], textTransform: "uppercase", letterSpacing: "1.2px", fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </label>
    <div
      className="sp-field"
      style={{
        padding: "10px 14px",
        background: G[50],
        border: `1.5px solid ${G[200]}`,
        borderRadius: 10,
        fontSize: 14, color: G[900], fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "default", userSelect: "text",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {value || "—"}
    </div>
  </div>
)

const s = {
  page: { minHeight: "100vh", background: G[50], fontFamily: "'DM Sans', sans-serif" },
  centered: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  spinRing: { width: 44, height: 44, borderRadius: "50%", border: `4px solid ${G[200]}`, position: "relative" },
  spinArc:  { position: "absolute", inset: -4, borderRadius: "50%", border: "4px solid transparent", borderTop: `4px solid ${G[500]}`, animation: "spin 0.75s linear infinite" },

  banner: {
    position: "relative",
    background: `linear-gradient(135deg, ${G[900]} 0%, ${G[700]} 50%, ${G[500]} 100%)`,
    paddingTop: 76, paddingBottom: 68, overflow: "hidden",
  },
  c1: { position: "absolute", top: -70, right: -70, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" },
  c2: { position: "absolute", bottom: 16, right: 140, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" },
  c3: { position: "absolute", top: 24, left: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)" },
  wave: { position: "absolute", bottom: 0, left: 0, width: "100%", height: 56, display: "block" },

  bannerInner: {
    maxWidth: 820, margin: "0 auto", padding: "0 28px",
    display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative", zIndex: 1,
  },
  avatarImg: {
    width: 96, height: 96, borderRadius: "50%", objectFit: "cover",
    border: "3px solid rgba(255,255,255,0.45)", display: "block",
    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
  },
  avatarFallback: {
    width: 96, height: 96, borderRadius: "50%",
    background: "rgba(255,255,255,0.13)", backdropFilter: "blur(10px)",
    border: "3px solid rgba(255,255,255,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 38, fontWeight: 700, color: "#fff",
    fontFamily: "'DM Serif Display', serif",
    boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
  },
  avatarGlow: {
    position: "absolute", inset: -8, borderRadius: "50%",
    background: `radial-gradient(circle, ${G[400]}35 0%, transparent 68%)`,
    pointerEvents: "none",
  },
  roleTag: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: G[300], letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  },
  heroName: {
    margin: "0 0 10px", fontSize: 30, fontWeight: 700,
    color: "#fff", letterSpacing: "-0.5px",
    fontFamily: "'DM Serif Display', serif", lineHeight: 1.15,
  },
  pill: {
    display: "inline-block",
    background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff", borderRadius: 999,
    padding: "4px 14px", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
  },

  body: { maxWidth: 820, margin: "0 auto", padding: "32px 24px 56px" },
  card: {
    background: "#fff", borderRadius: 18,
    boxShadow: `0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px ${G[100]}`,
    padding: "32px 28px",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 },
}

export default StudentProfile