import React, { useEffect, useState, useCallback } from "react"
import Teachermessage from "../../components/Teachermessages"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const Heading = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
    <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
    <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.1px" }}>{label}</h2>
  </div>
)

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", color:"#dc2626", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{msg}</div>
) : null

const ModeToggle = ({ mode, onChange }) => (
  <div style={{ display:"flex", background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:12, padding:4, gap:4, marginBottom:20 }}>
    {[
      { key:"sections", label:"📢 Sections" },
      { key:"students", label:"👤 Students" },
    ].map(({ key, label }) => (
      <button key={key} onClick={() => onChange(key)}
        style={{
          flex:1, padding:"8px 0", border:"none", borderRadius:9, fontSize:13, fontWeight:700,
          fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.18s",
          background: mode === key ? G[700] : "transparent",
          color:      mode === key ? "#fff"  : G[600],
        }}>{label}</button>
    ))}
  </div>
)

// ── THIS WAS MISSING in your updated file ─────────────────────────────────────
const SectionPicker = ({ sections, selected, onChange }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:8 }}>
      Select Sections (multiple allowed)
    </label>
    <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:180, overflowY:"auto", paddingRight:2 }}>
      {sections.map(s => {
        const checked = selected.includes(s.id)
        return (
          <label key={s.id}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px", borderRadius:10, cursor:"pointer",
              border:`1.5px solid ${checked ? G[400] : G[200]}`,
              background: checked ? G[50] : "#fff",
              transition:"all 0.14s",
            }}>
            <div style={{
              width:17, height:17, borderRadius:5, flexShrink:0,
              border:`2px solid ${checked ? G[600] : G[300]}`,
              background: checked ? G[600] : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.12s",
            }}>
              {checked && <span style={{ color:"#fff", fontSize:10, fontWeight:900, lineHeight:1 }}>✓</span>}
            </div>
            <input type="checkbox" checked={checked} onChange={() => {
              onChange(checked ? selected.filter(id => id !== s.id) : [...selected, s.id])
            }} style={{ display:"none" }} />
            <span style={{ fontSize:13, fontWeight:600, color:G[800] }}>{s.branch?.name} — {s.name}</span>
          </label>
        )
      })}
    </div>
  </div>
)

// ── Student picker ────────────────────────────────────────────────────────────
const StudentPicker = ({ sections, selectedSections, selectedStudents, onChange, onSectionsChange }) => {
  const [studentsBySec, setStudentsBySec] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchStudents = useCallback(async (sectionIds) => {
    const newIds = sectionIds.filter(sid => !studentsBySec[sid])
    if (newIds.length === 0) return
    setLoading(true)
    const results = {}
    await Promise.all(newIds.map(async sid => {
      try {
        const r = await api.get(`/api/messages/sections/${sid}/students/`)
        results[sid] = r.data
      } catch { results[sid] = [] }
    }))
    setStudentsBySec(prev => ({ ...prev, ...results }))
    setLoading(false)
  }, [studentsBySec])

  useEffect(() => {
    if (selectedSections.length > 0) fetchStudents(selectedSections)
  }, [selectedSections])

  const allStudents = selectedSections.flatMap(sid => studentsBySec[sid] || [])
  const filtered = allStudents.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleAll = () => {
    const allIds = filtered.map(s => s.id)
    const allSelected = allIds.every(id => selectedStudents.includes(id))
    if (allSelected) onChange(selectedStudents.filter(id => !allIds.includes(id)))
    else onChange([...new Set([...selectedStudents, ...allIds])])
  }

  const handleSectionChange = (newSids) => {
    const stillValid = newSids.flatMap(sid => (studentsBySec[sid] || []).map(s => s.id))
    onChange(selectedStudents.filter(id => stillValid.includes(id)))
    onSectionsChange(newSids)
  }

  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:8 }}>
        1 · Pick section(s) to load students from
      </label>

      <SectionPicker
        sections={sections}
        selected={selectedSections}
        onChange={handleSectionChange}
      />

      {selectedSections.length > 0 && (
        <>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", margin:"14px 0 8px" }}>
            2 · Select students
          </label>
          <input
            placeholder="Search by name or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"9px 12px", marginBottom:8, borderRadius:9, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50] }}
          />
          {loading ? (
            <p style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>Loading students…</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>No students found.</p>
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:11, color:"#9ca3af" }}>{selectedStudents.length} selected</span>
                <button onClick={toggleAll}
                  style={{ background:"none", border:"none", color:G[700], fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"underline", padding:0, fontFamily:"'DM Sans',sans-serif" }}>
                  {filtered.every(s => selectedStudents.includes(s.id)) ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:220, overflowY:"auto", paddingRight:2 }}>
                {filtered.map(s => {
                  const checked = selectedStudents.includes(s.id)
                  return (
                    <label key={s.id}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:9, cursor:"pointer", border:`1.5px solid ${checked ? G[400] : G[100]}`, background: checked ? G[50] : "#fff", transition:"all 0.12s" }}>
                      <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:`2px solid ${checked ? G[600] : G[300]}`, background: checked ? G[600] : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.12s" }}>
                        {checked && <span style={{ color:"#fff", fontSize:9, fontWeight:900, lineHeight:1 }}>✓</span>}
                      </div>
                      <input type="checkbox" checked={checked} onChange={() =>
                        onChange(checked ? selectedStudents.filter(id => id !== s.id) : [...selectedStudents, s.id])
                      } style={{ display:"none" }} />
                      <div>
                        <p style={{ margin:0, fontSize:12, fontWeight:700, color:G[800] }}>{s.full_name}</p>
                        <p style={{ margin:0, fontSize:10, color:"#9ca3af" }}>{s.roll_number}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const TeacherMessagesMain = () => {
  const [messages,     setMessages]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [sections,     setSections]     = useState([])

  const [mode,             setMode]             = useState("sections")
  const [selectedSections, setSelectedSections] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [title,            setTitle]            = useState("")
  const [message,          setMessage]          = useState("")

  const [sending,      setSending]      = useState(false)
  const [sendError,    setSendError]    = useState("")
  const [sendSuccess,  setSendSuccess]  = useState("")

  useEffect(() => { fetchMessages(); fetchTeacherSections() }, [])

  const fetchMessages = () => {
    api.get("/api/messages/inbox/")
      .then(res => { setMessages(res.data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }

  const fetchTeacherSections = () => {
    api.get("/api/assignments/")
      .then(res => {
        const seen = new Set(); const unique = []
        res.data.forEach(a => { if (!seen.has(a.section.id)) { seen.add(a.section.id); unique.push(a.section) } })
        setSections(unique)
      })
      .catch(err => console.error(err))
  }

  const resetForm = () => {
    setTitle(""); setMessage("")
    setSelectedSections([]); setSelectedStudents([])
    setMode("sections"); setSendError("")
  }

  const handleSend = async () => {
    setSendError("")
    if (!title.trim() || !message.trim()) { setSendError("Title and message are required"); return }
    if (mode === "sections" && selectedSections.length === 0) { setSendError("Select at least one section"); return }
    if (mode === "students" && selectedStudents.length === 0) { setSendError("Select at least one student"); return }

    const payload = {
      title:           title.trim(),
      message:         message.trim(),
      target_sections: mode === "sections" ? selectedSections : [],
      target_students: mode === "students" ? selectedStudents : [],
    }

    setSending(true)
    try {
      await api.post("/api/messages/send/", payload)
      resetForm()
      setShowForm(false)
      setSendSuccess(
        mode === "sections"
          ? `Message sent to ${selectedSections.length} section${selectedSections.length !== 1 ? "s" : ""}!`
          : `Message sent to ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}!`
      )
      fetchMessages()
    } catch (err) {
      setSendError(err.response?.data?.error || "Failed to send message")
    }
    setSending(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .tm-field:focus { border-color:${G[400]}!important; box-shadow:0 0 0 3px ${G[100]}!important; outline:none; }
        .tm-field { transition: border-color 0.2s, box-shadow 0.2s; }
      `}</style>

      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>
        <TeacherNav />

        <div style={{
          position:"relative",
          background:`linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`,
          paddingTop:56, paddingBottom:60, overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-70,right:-70,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
          <div style={{ position:"absolute",bottom:16,right:140,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }}/>
          <div style={{ maxWidth:700, margin:"0 auto", padding:"0 28px", position:"relative", zIndex:1, animation:"fadeUp 0.45s ease both" }}>
            <span style={{ display:"block", fontSize:11, fontWeight:700, color:G[300], letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:6 }}>Communication</span>
            <h1 style={{ margin:"0 0 10px", fontSize:30, fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif", lineHeight:1.15 }}>Messages</h1>
            <span style={{ display:"inline-block", background:"rgba(255,255,255,0.14)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.22)", color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:13, fontWeight:600 }}>
              Inbox &amp; Broadcast
            </span>
          </div>
          <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:56,display:"block" }} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]}/>
          </svg>
        </div>

        <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px 56px" }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, animation:"fadeUp 0.5s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:3, height:22, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }}/>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:G[900], fontFamily:"'DM Serif Display',serif" }}>Inbox</h2>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); resetForm(); setSendSuccess("") }}
              style={{
                background: showForm ? G[50] : G[700],
                color:      showForm ? G[700] : "#fff",
                border:     showForm ? `1.5px solid ${G[200]}` : "none",
                borderRadius:10, padding:"9px 20px", fontSize:13, fontWeight:600,
                fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.2s",
              }}>
              {showForm ? "Cancel" : "+ Send Message"}
            </button>
          </div>

          {sendSuccess && !showForm && (
            <div style={{ background:G[100], border:`1px solid ${G[300]}`, color:G[700], borderRadius:10, padding:"10px 16px", fontSize:13, fontWeight:600, marginBottom:16, animation:"fadeUp 0.35s ease both" }}>
               {sendSuccess}
            </div>
          )}

          {showForm && (
            <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", marginBottom:20, animation:"fadeUp 0.38s ease both" }}>
              <Heading label="New Message" />
              <ModeToggle mode={mode} onChange={m => { setMode(m); setSelectedSections([]); setSelectedStudents([]) }} />

              {mode === "sections" && (
                <SectionPicker
                  sections={sections}
                  selected={selectedSections}
                  onChange={setSelectedSections}
                />
              )}

              {mode === "students" && (
                <StudentPicker
                  sections={sections}
                  selectedSections={selectedSections}
                  selectedStudents={selectedStudents}
                  onChange={setSelectedStudents}
                  onSectionsChange={setSelectedSections}
                />
              )}

              <input
                type="text" placeholder="Title" value={title}
                onChange={e => setTitle(e.target.value)}
                className="tm-field"
                style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"10px 14px", marginBottom:12, borderRadius:10, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50] }}
              />

              <textarea
                placeholder="Message" value={message} rows={4}
                onChange={e => setMessage(e.target.value)}
                className="tm-field"
                style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"10px 14px", marginBottom:12, borderRadius:10, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50], resize:"none" }}
              />

              {(selectedSections.length > 0 || selectedStudents.length > 0) && (
                <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:10, padding:"8px 14px", marginBottom:12, fontSize:12, color:G[700], fontWeight:600 }}>
                  {mode === "sections"
                    ? `📢 Sending to ${selectedSections.length} section${selectedSections.length !== 1 ? "s" : ""}`
                    : `👤 Sending to ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}`
                  }
                </div>
              )}

              <ErrBox msg={sendError} />

              <button onClick={handleSend} disabled={sending}
                style={{ background:G[700], color:"#fff", border:"none", borderRadius:10, padding:"11px 0", fontSize:14, fontWeight:600, cursor:"pointer", width:"100%", opacity:sending ? 0.5 : 1, fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.2s" }}>
                {sending ? "Sending…" : "Send Message"}
              </button>
            </div>
          )}

          <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", animation:"fadeUp 0.44s ease both", animationDelay:"0.08s" }}>
            <Heading label="Inbox" />
            <div style={{ display:"flex", flexDirection:"column", gap:0, maxHeight:520, overflowY:"auto" }}>
              {loading ? (
                <p style={{ textAlign:"center", color:G[400], fontSize:13, padding:"24px 0" }}>Loading…</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign:"center", color:G[400], fontSize:13, padding:"24px 0" }}>No messages yet.</p>
              ) : (
                messages.map(msg => (
                  <Teachermessage
                    key={msg.id}
                    title={msg.title}
                    message={msg.message}
                    senderName={msg.sent_by_name}
                    senderType={msg.sender_type}
                    date={msg.created_at}
                    sectionNames={msg.section_names}
                    studentNames={msg.student_names}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default TeacherMessagesMain