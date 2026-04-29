import React, { useEffect, useRef, useState, useCallback } from "react"
import { QRCodeCanvas } from "qrcode.react"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
  400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
  800: "#166534", 900: "#14532d",
}

const SESSION_DURATION = 300
const QR_INTERVAL      = 5
const POLL_INTERVAL    = 5000

const fmt     = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
const fmtDate = d   => d   ? new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : ""
const pct     = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0

const Heading = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <div style={{ width: 3, height: 20, borderRadius: 2, background: `linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink: 0 }} />
    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G[800], fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.1px" }}>{label}</h2>
  </div>
)

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{msg}</div>
) : null

const OkBox = ({ msg }) => msg ? (
  <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, color: G[700], borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>{msg}</div>
) : null

const Pill = ({ ok }) => (
  <span style={{
    display: "inline-block", padding: "3px 12px", borderRadius: 999,
    fontSize: 11, fontWeight: 700,
    background: ok ? G[100] : "#f3f4f6",
    color: ok ? G[700] : "#6b7280",
  }}>{ok ? "Present" : "Absent"}</span>
)

const card = {
  background: "#fff", borderRadius: 18,
  boxShadow: `0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,
  padding: "26px 24px", marginBottom: 22,
}

const QRModal = ({ value, onClose, qrCounter }) => {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: "36px 40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation: "popIn 0.22s ease",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: G[100], border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer",
            fontSize: 16, color: G[700], display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700,
          }}
        >✕</button>

        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: G[600], letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Scan to Mark Attendance
        </p>

        <div style={{ padding: 16, background: G[50], borderRadius: 16, border: `2px solid ${G[200]}`, position: "relative" }}>
          <QRCodeCanvas value={value} size={320} key={value} />
          <div style={{
            position: "absolute", top: -12, right: -12,
            background: qrCounter <= 2 ? "#dc2626" : G[700],
            color: "#fff", borderRadius: "50%", width: 44, height: 44,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, lineHeight: 1,
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)", transition: "background 0.3s",
          }}>
            {qrCounter}
            <span style={{ fontSize: 8, opacity: 0.85 }}>sec</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
          QR refreshes every <strong style={{ color: G[700] }}>{QR_INTERVAL}s</strong> · Press <kbd style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  )
}

const LiveFeed = ({ presentIds, students }) => {
  const [open, setOpen] = useState(false)
  const presentStudents = students.filter(s => presentIds.includes(s.id))
  const absentStudents  = students.filter(s => !presentIds.includes(s.id))

  if (presentStudents.length === 0) return null

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", background: open ? G[700] : "#fff",
          border: `1.5px solid ${open ? G[700] : G[300]}`,
          borderRadius: open ? "12px 12px 0 0" : 12,
          padding: "10px 16px", cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: open ? "#fff" : G[500],
          display: "inline-block", flexShrink: 0,
          boxShadow: open ? "none" : `0 0 0 3px ${G[100]}`,
        }} />
        <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 700, color: open ? "#fff" : G[800] }}>
          QR Scanned — {presentStudents.length} student{presentStudents.length !== 1 ? "s" : ""} marked present
        </span>
        <span style={{ fontSize: 11, color: open ? G[200] : "#9ca3af", fontWeight: 600 }}>
          {open ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {open && (
        <div style={{
          border: `1.5px solid ${G[300]}`, borderTop: "none",
          borderRadius: "0 0 12px 12px",
          background: "#fff", padding: "16px",
          animation: "fadeUp 0.18s ease",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: G[600], letterSpacing: "1.2px", textTransform: "uppercase" }}>
                Present ({presentStudents.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {presentStudents.map(s => (
                  <div key={s.id} style={{
                    background: G[50], border: `1.5px solid ${G[200]}`,
                    borderRadius: 8, padding: "7px 10px",
                    display: "flex", alignItems: "center", gap: 8,
                    animation: "fadeUp 0.25s ease",
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: G[500], flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: G[800] }}>{s.full_name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{s.roll_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#dc2626", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                Not yet scanned ({absentStudents.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {absentStudents.map(s => (
                  <div key={s.id} style={{
                    background: "#fef2f2", border: "1.5px solid #fecaca",
                    borderRadius: 8, padding: "7px 10px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fca5a5", flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#991b1b" }}>{s.full_name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#f87171" }}>{s.roll_number}</p>
                    </div>
                  </div>
                ))}
                {absentStudents.length === 0 && (
                  <p style={{ fontSize: 12, color: G[600], fontWeight: 600, margin: 0 }}>🎉 Everyone scanned!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MarkAttendance() {
  const [assignments,     setAssignments]     = useState([])
  const [loadingAssign,   setLoadingAssign]   = useState(true)
  const [assignmentId,    setAssignmentId]    = useState("")
  const [sessionId,       setSessionId]       = useState(null)
  const [qrValue,         setQrValue]         = useState("")
  const [isActive,        setIsActive]        = useState(false)
  const [counter,         setCounter]         = useState(SESSION_DURATION)
  const [qrCounter,       setQrCounter]       = useState(QR_INTERVAL)
  const [sessionErr,      setSessionErr]      = useState("")
  const [students,        setStudents]        = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [presentIds,      setPresentIds]      = useState([])
  const [submitting,      setSubmitting]      = useState(false)
  const [submitMsg,       setSubmitMsg]       = useState("")
  const [submitErr,       setSubmitErr]       = useState("")
  const [tab,             setTab]             = useState("attend")
  const [sessions,        setSessions]        = useState([])
  const [sessionDetail,   setSessionDetail]   = useState(null)
  const [loadingHist,     setLoadingHist]     = useState(false)
  const [loadingDetail,   setLoadingDetail]   = useState(false)
  const [qrModalOpen,     setQrModalOpen]     = useState(false)
  const [qrVisible,       setQrVisible]       = useState(true)   // ← NEW

  const pollRef    = useRef(null)
  const sessionRef = useRef(null)
  const qrRotRef   = useRef(null)
  const qrBadgeRef = useRef(null)

  useEffect(() => {
    setLoadingAssign(true)
    api.get("/api/assignments/")
      .then(r => setAssignments(r.data))
      .catch(console.error)
      .finally(() => setLoadingAssign(false))
  }, [])

  useEffect(() => {
    if (!assignmentId) { setStudents([]); return }
    const a = assignments.find(x => x.id === parseInt(assignmentId))
    if (!a) return
    setLoadingStudents(true)
    api.get(`/api/sections/${a.section.id}/students/`)
      .then(r => setStudents(r.data))
      .catch(console.error)
      .finally(() => setLoadingStudents(false))
  }, [assignmentId, assignments])

  useEffect(() => {
    if (tab === "history" && assignmentId) loadHistory()
  }, [tab, assignmentId])

  const resetAll = val => {
    stopAllIntervals()
    setAssignmentId(val)
    setSessionId(null); setQrValue(""); setIsActive(false)
    setCounter(SESSION_DURATION); setQrCounter(QR_INTERVAL)
    setSessionErr(""); setSubmitMsg(""); setSubmitErr("")
    setPresentIds([])
    setSessions([]); setSessionDetail(null)
    setTab("attend")
    setQrModalOpen(false)
    setQrVisible(true)   // ← RESET
  }

  const stopAllIntervals = () => {
    clearInterval(pollRef.current)
    clearInterval(sessionRef.current)
    clearInterval(qrRotRef.current)
    clearInterval(qrBadgeRef.current)
  }

  const startPolling = useCallback((sid) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/api/attendance/session/${sid}/scans/`)
        const scannedIds = r.data.scanned_student_ids || []
        setPresentIds(prev => {
          const merged = new Set(prev)
          scannedIds.forEach(id => merged.add(id))
          return Array.from(merged)
        })
      } catch (e) { console.error("poll error", e) }
    }, POLL_INTERVAL)
  }, [])

  const startSessionTimer = useCallback(() => {
    clearInterval(sessionRef.current)
    sessionRef.current = setInterval(() => {
      setCounter(p => {
        if (p <= 1) {
          clearInterval(sessionRef.current)
          clearInterval(qrRotRef.current)
          clearInterval(qrBadgeRef.current)
          clearInterval(pollRef.current)
          setIsActive(false); setQrValue("")
          setQrModalOpen(false)
          return 0
        }
        return p - 1
      })
    }, 1000)
  }, [])

  const startQrRotation = useCallback((sid) => {
    clearInterval(qrRotRef.current)
    qrRotRef.current = setInterval(async () => {
      try {
        const r = await api.post("/api/attendance/refresh-qr/", { session_id: sid })
        setQrValue(r.data.qr_token)
        setQrCounter(QR_INTERVAL)
      } catch (e) { console.error("QR refresh failed", e) }
    }, QR_INTERVAL * 1000)
  }, [])

  const startQrBadge = useCallback(() => {
    clearInterval(qrBadgeRef.current)
    qrBadgeRef.current = setInterval(() => {
      setQrCounter(p => p <= 1 ? QR_INTERVAL : p - 1)
    }, 1000)
  }, [])

  const startSession = async () => {
    setSessionErr(""); setSubmitMsg(""); setSubmitErr("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      const sid = r.data.session_id
      setSessionId(sid)
      setQrValue(r.data.qr_token)
      setIsActive(true)
      setCounter(SESSION_DURATION)
      setQrCounter(QR_INTERVAL)
      setPresentIds([])
      setQrVisible(true)   // ← RESET on new session
      startSessionTimer()
      startQrRotation(sid)
      startQrBadge()
      startPolling(sid)
    } catch (e) {
      setSessionErr(e.response?.data?.error || "Failed to start session")
    }
  }

  const submitAttendance = async () => {
    if (!sessionId) { setSubmitErr("No active session."); return }
    setSubmitting(true); setSubmitMsg(""); setSubmitErr("")
    try {
      await api.post("/api/attendance/submit/", {
        session_id: sessionId,
        present_student_ids: presentIds,
      })
      stopAllIntervals()
      setIsActive(false); setQrValue("")
      setQrModalOpen(false)
      setSubmitMsg(`Attendance submitted! ${presentIds.length} present, ${students.length - presentIds.length} absent.`)
      setSessionId(null)
    } catch (e) {
      setSubmitErr(e.response?.data?.error || "Failed to submit attendance")
    }
    setSubmitting(false)
  }

  const toggleStudent = id =>
    setPresentIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const loadHistory = async () => {
    setLoadingHist(true); setSessions([]); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/sessions/?assignment_id=${assignmentId}`)
      setSessions(r.data)
    } catch (e) { console.error(e) }
    setLoadingHist(false)
  }

  const loadDetail = async sid => {
    setLoadingDetail(true); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/session/${sid}/`)
      setSessionDetail(r.data)
    } catch (e) { console.error(e) }
    setLoadingDetail(false)
  }

  const selectedAssignment = assignments.find(a => a.id === parseInt(assignmentId))
  const sessionPct   = Math.round((counter / SESSION_DURATION) * 100)
  const presentCount = presentIds.length
  const absentCount  = students.length - presentCount

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .ma-tab-active  { border-bottom:2px solid ${G[700]}!important; color:${G[700]}!important; }
        .ma-tab:hover   { color:${G[600]}!important; }
        .ma-row:hover   { border-color:${G[300]}!important; }
        .ma-session:hover { border-color:${G[300]}!important; }
        .ma-select:focus  { border-color:${G[400]}!important; box-shadow:0 0 0 3px ${G[100]}!important; outline:none; }
        .qr-hover:hover { transform:scale(1.02); box-shadow:0 8px 24px rgba(21,128,61,0.18)!important; }
        .qr-hover { transition: transform 0.15s, box-shadow 0.15s; }
      `}</style>

      {/* QR Fullscreen Modal */}
      {qrModalOpen && qrValue && (
        <QRModal value={qrValue} qrCounter={qrCounter} onClose={() => setQrModalOpen(false)} />
      )}

      <div style={{ minHeight: "100vh", background: G[50], fontFamily: "'DM Sans',sans-serif" }}>
        <TeacherNav />

        {/* Header */}
        <div style={{
          position: "relative",
          background: `linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`,
          paddingTop: 52, paddingBottom: 58, overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1, animation: "fadeUp 0.4s ease both" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: G[300], letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6 }}>Attendance</span>
            <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'DM Serif Display',serif", lineHeight: 1.15 }}>Mark Attendance</h1>
            {selectedAssignment && (
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                {selectedAssignment.subject.name} · {selectedAssignment.section.branch.name} {selectedAssignment.section.name}
              </span>
            )}
          </div>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 52, display: "block" }} viewBox="0 0 1440 52" preserveAspectRatio="none">
            <path d="M0,26 C480,65 960,0 1440,30 L1440,52 L0,52 Z" fill={G[50]} />
          </svg>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>

          {/* Class selector */}
          <div style={{ ...card, padding: "20px 22px", marginBottom: 18, animation: "fadeUp 0.45s ease both" }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: G[600], textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Select Class</label>
            {loadingAssign ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" fill="none" stroke={G[300]} strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={G[600]} strokeWidth="3" strokeLinecap="round" />
                </svg>
                Loading classes…
              </div>
            ) : (
              <select value={assignmentId} onChange={e => resetAll(e.target.value)}
                className="ma-select"
                style={{ width: "100%", maxWidth: 440, border: `1.5px solid ${G[200]}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: G[900], background: G[50], cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s,box-shadow 0.2s" }}>
                <option value="">— Pick a class —</option>
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>{a.subject.name} — {a.section.branch.name} {a.section.name}</option>
                ))}
              </select>
            )}
          </div>

          {assignmentId && (
            <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${G[100]}`, marginBottom: 22, animation: "fadeUp 0.45s ease both", animationDelay: "0.05s" }}>
              {[["attend", "Take Attendance"], ["history", "History"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`ma-tab${tab === key ? " ma-tab-active" : ""}`}
                  style={{
                    padding: "10px 22px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    color: tab === key ? G[700] : "#9ca3af",
                    borderBottom: tab === key ? `2px solid ${G[700]}` : "2px solid transparent",
                    marginBottom: -2, transition: "color 0.15s", fontFamily: "'DM Sans',sans-serif",
                  }}>{label}</button>
              ))}
            </div>
          )}

          {assignmentId && tab === "attend" && (
            <>
              <ErrBox msg={sessionErr} />
              <OkBox msg={submitMsg} />
              <ErrBox msg={submitErr} />

              {!isActive && !sessionId && !submitMsg && (
                <div style={{ ...card, textAlign: "center", padding: "40px 24px", animation: "fadeUp 0.4s ease both" }}>
                  <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.6 }}>
                    Start a session for <strong style={{ color: G[700] }}>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong>
                  </p>
                  <button onClick={startSession}
                    style={{ background: G[700], color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Start Attendance Session
                  </button>
                </div>
              )}

              {(isActive || (sessionId && !submitMsg)) && (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)", gap: 18, animation: "fadeUp 0.4s ease both", alignItems: "start" }}>

                  {/* QR Panel */}
                  <div style={{ ...card, marginBottom: 0, textAlign: "center" }}>
                    <Heading label="QR Code" />

                    {/* Session timer ring */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 18 }}>
                      <svg width="52" height="52" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                        <circle cx="30" cy="30" r="25" fill="none" stroke={G[100]} strokeWidth="4" />
                        <circle cx="30" cy="30" r="25" fill="none"
                          stroke={counter > 60 ? G[600] : "#dc2626"} strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 25}`}
                          strokeDashoffset={`${2 * Math.PI * 25 * (1 - sessionPct / 100)}`}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear,stroke 0.5s" }} />
                      </svg>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: counter > 60 ? G[700] : "#dc2626", lineHeight: 1, fontFamily: "'DM Serif Display',serif" }}>{counter}s</p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>session expires</p>
                      </div>
                    </div>

                    {/* ── QR visible/hidden toggle ── */}
                    {isActive && qrValue && (
                      <>
                        {/* Toggle button */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                          <button
                            onClick={() => setQrVisible(v => !v)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6,
                              background: qrVisible ? "#fef2f2" : G[100],
                              border: `1.5px solid ${qrVisible ? "#fecaca" : G[300]}`,
                              color: qrVisible ? "#dc2626" : G[700],
                              borderRadius: 8, padding: "6px 16px",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                              transition: "all 0.18s",
                            }}
                          >
                            {qrVisible ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                </svg>
                                Hide QR
                              </>
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                                Show QR
                              </>
                            )}
                          </button>
                        </div>

                        {/* Clickable QR (conditionally shown) */}
                        {qrVisible && (
                          <div
                            onClick={() => setQrModalOpen(true)}
                            className="qr-hover"
                            title="Click to expand for projector"
                            style={{
                              position: "relative", display: "inline-block", marginBottom: 8,
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ padding: 12, background: G[50], borderRadius: 14, border: `1.5px solid ${G[200]}` }}>
                              <QRCodeCanvas value={qrValue} size={180} key={qrValue} />
                            </div>

                            {/* Refresh countdown badge */}
                            <div style={{
                              position: "absolute", top: -10, right: -10,
                              background: qrCounter <= 2 ? "#dc2626" : G[700],
                              color: "#fff", borderRadius: "50%", width: 36, height: 36,
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 700, lineHeight: 1,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "background 0.3s",
                            }}>
                              {qrCounter}
                              <span style={{ fontSize: 7, opacity: 0.85 }}>sec</span>
                            </div>

                            {/* Expand hint */}
                            <div style={{
                              position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                              background: G[700], color: "#fff", borderRadius: 999,
                              padding: "2px 10px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                            }}>⛶ Click to expand</div>
                          </div>
                        )}

                        {/* Placeholder when hidden */}
                        {!qrVisible && (
                          <div style={{
                            display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            width: 204, height: 204, borderRadius: 14,
                            border: `2px dashed ${G[300]}`, background: G[50],
                            color: G[400], fontSize: 12, fontWeight: 600, gap: 8,
                            marginBottom: 8,
                          }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M17 20h3M20 17v3"/>
                            </svg>
                            QR hidden
                          </div>
                        )}
                      </>
                    )}

                    {!isActive && sessionId && (
                      <div style={{ padding: "14px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, marginBottom: 12, fontSize: 13, color: "#92400e" }}>
                        Session expired — QR inactive.<br />Review the list below and submit.
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "14px 0 4px" }}>Rotates every <strong style={{ color: G[700] }}>{QR_INTERVAL}s</strong></p>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                      <div style={{ background: G[100], borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G[700], fontFamily: "'DM Serif Display',serif" }}>{presentCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: G[600] }}>Present</p>
                      </div>
                      <div style={{ background: "#fef2f2", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#dc2626", fontFamily: "'DM Serif Display',serif" }}>{absentCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#dc2626" }}>Absent</p>
                      </div>
                      <div style={{ background: G[50], border: `1px solid ${G[200]}`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G[800], fontFamily: "'DM Serif Display',serif" }}>{students.length}</p>
                        <p style={{ margin: 0, fontSize: 10, color: G[600] }}>Total</p>
                      </div>
                    </div>
                  </div>

                  {/* Right column: LiveFeed + Student List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <LiveFeed presentIds={presentIds} students={students} />

                    {/* Student List Panel */}
                    <div style={{ ...card, marginBottom: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <Heading label="Student List" />
                        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                          <button onClick={() => setPresentIds(students.map(s => s.id))}
                            style={{ background: "none", border: "none", color: G[700], fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'DM Sans',sans-serif" }}>All Present</button>
                          <button onClick={() => setPresentIds([])}
                            style={{ background: "none", border: "none", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'DM Sans',sans-serif" }}>All Absent</button>
                        </div>
                      </div>

                      <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>
                        Students who scan the QR flip to <strong style={{ color: G[700] }}>Present</strong> automatically. Toggle anyone to override.
                      </p>

                      {loadingStudents ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "28px 0", color: "#9ca3af", fontSize: 13 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                            <circle cx="12" cy="12" r="10" fill="none" stroke={G[200]} strokeWidth="3" />
                            <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={G[500]} strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Loading students…
                        </div>
                      ) : students.length === 0 ? (
                        <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No students found in this section.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto", marginBottom: 18, paddingRight: 2 }}>
                          {students.map(s => {
                            const present = presentIds.includes(s.id)
                            return (
                              <div key={s.id} onClick={() => toggleStudent(s.id)} className="ma-row"
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "11px 13px", borderRadius: 10,
                                  border: `1.5px solid ${present ? G[300] : G[200]}`,
                                  background: present ? G[50] : "#fff",
                                  cursor: "pointer", transition: "all 0.12s",
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                  <div style={{
                                    width: 17, height: 17, borderRadius: 5,
                                    border: `2px solid ${present ? G[600] : G[300]}`,
                                    background: present ? G[600] : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, transition: "all 0.12s",
                                  }}>
                                    {present && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                  </div>
                                  <div>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G[800] }}>{s.full_name}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.roll_number}</p>
                                  </div>
                                </div>
                                <Pill ok={present} />
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <button onClick={submitAttendance} disabled={submitting || students.length === 0}
                        style={{
                          width: "100%", background: G[700], color: "#fff", border: "none",
                          borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700,
                          cursor: (submitting || students.length === 0) ? "not-allowed" : "pointer",
                          opacity: (submitting || students.length === 0) ? 0.5 : 1,
                          fontFamily: "'DM Sans',sans-serif", transition: "opacity 0.2s",
                        }}>
                        {submitting ? "Submitting…" : `Submit Attendance (${presentCount} Present)`}
                      </button>
                      <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "8px 0 0" }}>
                        Submitting will close the session and save to records.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* History Tab */}
          {assignmentId && tab === "history" && (
            <div style={{ ...card, animation: "fadeUp 0.4s ease both" }}>
              <Heading label="Attendance History" />
              {!sessionDetail ? (
                <>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>
                    All submitted sessions for <strong style={{ color: G[700] }}>{selectedAssignment?.subject.name}</strong> — {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}.
                  </p>
                  {loadingHist && <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p>}
                  {!loadingHist && sessions.length === 0 && (
                    <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No sessions recorded yet.</p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sessions.map(s => {
                      const p = pct(s.present_count, s.total_count)
                      return (
                        <div key={s.session_id} onClick={() => loadDetail(s.session_id)} className="ma-session"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${G[200]}`, background: "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[800] }}>{fmtDate(s.date)}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{fmt(s.start_time)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: p >= 75 ? G[700] : "#dc2626" }}>{p}%</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.present_count}/{s.total_count} present</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div>
                  <button onClick={() => setSessionDetail(null)}
                    style={{ background: "none", border: "none", color: G[600], fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: "0 0 16px", display: "block", fontFamily: "'DM Sans',sans-serif" }}>
                    ← Back to sessions
                  </button>
                  <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: G[800], fontSize: 14 }}>{fmtDate(sessionDetail.date)} · {fmt(sessionDetail.start_time)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{sessionDetail.subject} · {sessionDetail.section}</p>
                  </div>
                  {loadingDetail ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p> : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: G[700], fontFamily: "'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => r.status).length}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Present</p>
                        </div>
                        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#dc2626", fontFamily: "'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => !r.status).length}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Absent</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {sessionDetail.attendance.map(r => (
                          <div key={r.student_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${G[100]}`, background: "#fff" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G[800] }}>{r.full_name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.roll_number}</p>
                            </div>
                            <Pill ok={r.status} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!assignmentId && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Select a class above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}