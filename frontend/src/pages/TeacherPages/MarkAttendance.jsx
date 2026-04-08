import React, { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

/* ─── helpers ─── */
const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : ""

/* ─── small shared components ─── */
const Pill = ({ ok, children }) => (
  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: ok ? "#dcfce7" : "#f3f4f6", color: ok ? "#15803d" : "#6b7280" }}>{children}</span>
)

const ErrorBox = ({ msg }) => msg ? (
  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{msg}</div>
) : null

const SuccessBox = ({ msg }) => msg ? (
  <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#15803d", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{msg}</div>
) : null

const SectionLabel = ({ children }) => (
  <p style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", paddingBottom: 12 }}>{children}</p>
)

const ClassContext = ({ assignment }) => {
  if (!assignment) return null
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "12px 16px", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{assignment.subject.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
          {assignment.subject.code} &nbsp;·&nbsp; {assignment.section.branch.name} {assignment.section.name}
        </p>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{fmtDate(new Date().toISOString())}</p>
    </div>
  )
}

/* ─── style tokens ─── */
const card = { background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", padding: "24px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }
const btnGreen = { background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }
const btnBlue  = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }
const btnRed   = { background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }
const linkBtn  = (color) => ({ background: "none", border: "none", color, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 })

/* ════════════════════════════════════════════════════════════════ */
const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([])
  const [assignmentId, setAssignmentId] = useState("")
  const [tab, setTab] = useState("qr")

  // QR state
  const [qrValue, setQrValue] = useState("")
  const [qrSessionId, setQrSessionId] = useState(null)
  const [counter, setCounter] = useState(300)
  const [isActive, setIsActive] = useState(false)
  const [qrError, setQrError] = useState("")

  // Manual state
  const [students, setStudents] = useState([])
  const [presentIds, setPresentIds] = useState([])
  const [manualSessionId, setManualSessionId] = useState(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [manualSaving, setManualSaving] = useState(false)
  const [manualMsg, setManualMsg] = useState("")
  const [manualError, setManualError] = useState("")

  // History state
  const [sessions, setSessions] = useState([])
  const [sessionDetail, setSessionDetail] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Load only THIS teacher's assignments (backend now filters by authenticated teacher)
  useEffect(() => {
    api.get("/api/assignments/").then((r) => setAssignments(r.data)).catch(console.error)
  }, [])

  // QR countdown timer
  useEffect(() => {
    if (!isActive) return
    const t = setInterval(() => {
      setCounter((p) => {
        if (p <= 1) { clearInterval(t); setIsActive(false); setQrValue(""); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [isActive])

  // Load students when assignment changes
  useEffect(() => {
    if (!assignmentId) { setStudents([]); return }
    const a = assignments.find((x) => x.id === parseInt(assignmentId))
    if (!a) return
    api.get(`/api/sections/${a.section.id}/students/`)
      .then((r) => { setStudents(r.data); setPresentIds([]) })
      .catch(console.error)
  }, [assignmentId, assignments])

  // Load history when switching to history tab
  useEffect(() => {
    if (tab === "history" && assignmentId) loadHistory()
  }, [tab, assignmentId])

  const resetAll = (val) => {
    setAssignmentId(val)
    setIsActive(false); setQrValue(""); setQrSessionId(null); setQrError("")
    setManualSessionId(null); setManualMsg(""); setManualError(""); setPresentIds([])
    setSessions([]); setSessionDetail(null)
  }

  /* ── QR ── */
  const startQr = async () => {
    setQrError("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      setQrValue(r.data.qr_token)
      setQrSessionId(r.data.session_id)
      setCounter(300)
      setIsActive(true)
    } catch (e) {
      setQrError(e.response?.data?.error || "Failed to start attendance")
    }
  }

  /* ── Manual ── */
  const createManualSession = async () => {
    setCreatingSession(true); setManualError("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      setManualSessionId(r.data.session_id)
    } catch (e) {
      setManualError(e.response?.data?.error || "Failed to create session")
    }
    setCreatingSession(false)
  }

  const toggleStudent = (id) =>
    setPresentIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const saveManual = async () => {
    if (!manualSessionId) { setManualError("Start a session first."); return }
    setManualSaving(true); setManualMsg(""); setManualError("")
    try {
      await api.post("/api/attendance/manual/", {
        session_id: manualSessionId,
        present_student_ids: presentIds,
      })
      setManualMsg(`Saved! ${presentIds.length} of ${students.length} marked present.`)
    } catch (e) {
      setManualError(e.response?.data?.error || "Failed to save")
    }
    setManualSaving(false)
  }

  /* ── History ── */
  const loadHistory = async () => {
    setLoadingHistory(true); setSessions([]); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/sessions/?assignment_id=${assignmentId}`)
      setSessions(r.data)
    } catch (e) { console.error(e) }
    setLoadingHistory(false)
  }

  const loadDetail = async (sid) => {
    setLoadingDetail(true); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/session/${sid}/`)
      setSessionDetail(r.data)
    } catch (e) { console.error(e) }
    setLoadingDetail(false)
  }

  const selectedAssignment = assignments.find((a) => a.id === parseInt(assignmentId))
  const pct = Math.round((counter / 300) * 100)

  return (
    <>
      <TeacherNav />
      <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui,sans-serif" }}>

        {/* Page header + tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 24px 0" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <h1 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, color: "#111827" }}>Mark Attendance</h1>

            {/* Assignment dropdown */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px" }}>Select Class</label>
              <select
                value={assignmentId}
                onChange={(e) => resetAll(e.target.value)}
                style={{ width: "100%", maxWidth: 400, border: "1.5px solid #d1d5db", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#111827", background: "#fff", outline: "none", cursor: "pointer" }}
              >
                <option value="">— Pick a class —</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.subject.name} — {a.section.branch.name} {a.section.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab bar */}
            {assignmentId && (
              <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb" }}>
                {[["qr", "QR Attendance"], ["manual", "Manual Attendance"], ["history", "History"]].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)} style={{
                    padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: tab === key ? "#2563eb" : "#6b7280",
                    borderBottom: tab === key ? "2px solid #2563eb" : "2px solid transparent",
                    marginBottom: -2, transition: "color 0.15s"
                  }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Class context pill (shown on all tabs) */}
          {assignmentId && <ClassContext assignment={selectedAssignment} />}

          {/* ════ QR TAB ════ */}
          {assignmentId && tab === "qr" && (
            <div style={card}>
              <SectionLabel>QR Code Session</SectionLabel>
              <ErrorBox msg={qrError} />

              {!isActive ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20, maxWidth: 380, margin: "0 auto 20px" }}>
                    Generate a QR code for students in <strong>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong> to scan.
                    The code expires in 5 minutes.
                  </p>
                  <button onClick={startQr} style={btnGreen}>Generate QR Code</button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  {/* Countdown ring */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                      <circle cx="28" cy="28" r="23" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle cx="28" cy="28" r="23" fill="none"
                        stroke={counter > 60 ? "#16a34a" : "#dc2626"} strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 23}`}
                        strokeDashoffset={`${2 * Math.PI * 23 * (1 - pct / 100)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
                    </svg>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: counter > 60 ? "#15803d" : "#dc2626", lineHeight: 1 }}>{counter}s</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>until expiry</p>
                    </div>
                  </div>

                  <div style={{ display: "inline-block", padding: 16, background: "#f9fafb", borderRadius: 16, border: "1.5px solid #e5e7eb", marginBottom: 16 }}>
                    <QRCodeCanvas value={qrValue} size={220} />
                  </div>

                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px" }}>
                    Only students from <strong>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong> can mark attendance
                  </p>

                  <button onClick={() => { setIsActive(false); setQrValue("") }} style={btnRed}>Stop Session</button>
                </div>
              )}
            </div>
          )}

          {/* ════ MANUAL TAB ════ */}
          {assignmentId && tab === "manual" && (
            <div style={card}>
              <SectionLabel>Manual Attendance</SectionLabel>

              {/* Session status */}
              {!manualSessionId ? (
                <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>No session started yet</p>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: "#b45309" }}>
                    You're about to record attendance for <strong>{selectedAssignment?.subject.name}</strong> ({selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}) — {fmtDate(new Date().toISOString())}
                  </p>
                  <ErrorBox msg={manualError} />
                  <button onClick={createManualSession} disabled={creatingSession} style={{ ...btnBlue, opacity: creatingSession ? 0.6 : 1 }}>
                    {creatingSession ? "Starting…" : "Start Attendance Session"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>✓</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#15803d" }}>Session Active</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#16a34a" }}>
                      {selectedAssignment?.subject.name} · {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name} · {fmtDate(new Date().toISOString())}
                    </p>
                  </div>
                </div>
              )}

              {/* Students */}
              {students.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No students found in this section.</p>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      {students.length} students &nbsp;·&nbsp; <span style={{ color: "#16a34a" }}>{presentIds.length} present</span> &nbsp;·&nbsp; <span style={{ color: "#dc2626" }}>{students.length - presentIds.length} absent</span>
                    </p>
                    <div style={{ display: "flex", gap: 14 }}>
                      <button onClick={() => setPresentIds(students.map((s) => s.id))} style={linkBtn("#2563eb")}>Select All</button>
                      <button onClick={() => setPresentIds([])} style={linkBtn("#dc2626")}>Clear</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto", marginBottom: 20 }}>
                    {students.map((s) => {
                      const present = presentIds.includes(s.id)
                      return (
                        <div key={s.id} onClick={() => toggleStudent(s.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${present ? "#86efac" : "#e5e7eb"}`, background: present ? "#f0fdf4" : "#fff", cursor: "pointer", transition: "all 0.12s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${present ? "#16a34a" : "#d1d5db"}`, background: present ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s" }}>
                              {present && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{s.full_name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.roll_number}</p>
                            </div>
                          </div>
                          <Pill ok={present}>{present ? "Present" : "Absent"}</Pill>
                        </div>
                      )
                    })}
                  </div>

                  <SuccessBox msg={manualMsg} />
                  {manualSessionId && <ErrorBox msg={manualError} />}

                  <button onClick={saveManual} disabled={manualSaving || !manualSessionId}
                    style={{ ...btnGreen, opacity: (manualSaving || !manualSessionId) ? 0.5 : 1 }}>
                    {manualSaving ? "Saving…" : "Save Attendance"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ════ HISTORY TAB ════ */}
          {assignmentId && tab === "history" && (
            <div style={card}>
              <SectionLabel>Attendance History</SectionLabel>

              {!sessionDetail ? (
                <>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                    All recorded sessions for <strong>{selectedAssignment?.subject.name}</strong> — {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}.
                    Click a session to see who was present.
                  </p>

                  {loadingHistory && <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p>}

                  {!loadingHistory && sessions.length === 0 && (
                    <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No sessions recorded yet for this class.</p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sessions.map((s) => {
                      const pct = s.total_count > 0 ? Math.round((s.present_count / s.total_count) * 100) : 0
                      return (
                        <div key={s.session_id} onClick={() => loadDetail(s.session_id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none" }}
                        >
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{fmtDate(s.date)}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{fmt(s.start_time)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: pct >= 75 ? "#16a34a" : "#dc2626" }}>{pct}%</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{s.present_count}/{s.total_count} present</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* Session detail view */
                <div>
                  <button onClick={() => setSessionDetail(null)} style={{ ...linkBtn("#6b7280"), marginBottom: 16, fontSize: 13 }}>← Back to sessions</button>
                  <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#111827", fontSize: 14 }}>
                      {fmtDate(sessionDetail.date)} &nbsp;·&nbsp; {fmt(sessionDetail.start_time)}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                      {sessionDetail.subject} &nbsp;·&nbsp; {sessionDetail.section}
                    </p>
                  </div>

                  {loadingDetail ? (
                    <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                        <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#15803d" }}>
                            {sessionDetail.attendance.filter((r) => r.status).length}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Present</p>
                        </div>
                        <div style={{ flex: 1, background: "#fef2f2", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
                            {sessionDetail.attendance.filter((r) => !r.status).length}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Absent</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {sessionDetail.attendance.map((r) => (
                          <div key={r.student_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{r.full_name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.roll_number}</p>
                            </div>
                            <Pill ok={r.status}>{r.status ? "Present" : "Absent"}</Pill>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Prompt if no class selected */}
          {!assignmentId && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 14 }}>Select a class above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MarkAttendance