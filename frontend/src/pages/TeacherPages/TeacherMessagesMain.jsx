import React, { useEffect, useState } from "react"
import Teachermessage from "../../components/Teachermessages"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50:  "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0",
  300: "#86efac", 400: "#4ade80", 500: "#22c55e",
  600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d",
}

const TeacherMessagesMain = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sections, setSections] = useState([])
  const [form, setForm] = useState({ title: "", message: "", target_section: "" })
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [sendSuccess, setSendSuccess] = useState("")

  useEffect(() => { fetchMessages(); fetchTeacherSections() }, [])

  const fetchMessages = () => {
    api.get("/api/messages/inbox/")
      .then((res) => { setMessages(res.data); setLoading(false) })
      .catch((err) => { console.error(err); setLoading(false) })
  }

  const fetchTeacherSections = () => {
    api.get("/api/assignments/")
      .then((res) => {
        const seen = new Set()
        const uniqueSections = []
        res.data.forEach((a) => {
          if (!seen.has(a.section.id)) { seen.add(a.section.id); uniqueSections.push(a.section) }
        })
        setSections(uniqueSections)
      })
      .catch((err) => console.error(err))
  }

  const handleSend = async () => {
    if (!form.title || !form.message || !form.target_section) { setSendError("All fields are required"); return }
    setSending(true); setSendError(""); setSendSuccess("")
    try {
      await api.post("/api/messages/send/", {
        title: form.title, message: form.message, target_section: parseInt(form.target_section),
      })
      setForm({ title: "", message: "", target_section: "" })
      setShowForm(false); setSendSuccess("Message sent successfully!"); fetchMessages()
    } catch (err) { setSendError(err.response?.data?.error || "Failed to send message") }
    setSending(false)
  }

  return (
    <>
      <TeacherNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .tm-input:focus, .tm-select:focus, .tm-textarea:focus {
          border-color: ${G[400]} !important; box-shadow: 0 0 0 3px ${G[100]} !important; outline: none;
        }
        .tm-send-btn:hover { background: ${G[700]} !important; }
        .tm-cancel-btn:hover { background: ${G[100]} !important; }
      `}</style>

      <div style={s.page}>
        <div style={s.inner}>

          {/* Header row */}
          <div style={{ ...s.headerRow, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={s.bar} />
              <h1 style={s.pageTitle}>Messages</h1>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setSendError(""); setSendSuccess("") }}
              className={showForm ? "tm-cancel-btn" : "tm-send-btn"}
              style={showForm ? s.cancelBtn : s.sendBtn}
            >
              {showForm ? "Cancel" : "+ Send Message"}
            </button>
          </div>

          {sendSuccess && !showForm && (
            <div style={{ ...s.successBanner, animation: "fadeUp 0.35s ease both" }}>{sendSuccess}</div>
          )}

          {/* Send form */}
          {showForm && (
            <div style={{ ...s.card, animation: "fadeUp 0.38s ease both", marginBottom: 16 }}>
              <SectionLabel label="Send Message to Section" />

              <select
                value={form.target_section}
                onChange={(e) => setForm({ ...form, target_section: e.target.value })}
                className="tm-select"
                style={s.formField}
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.branch?.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="tm-input"
                style={s.formField}
              />

              <textarea
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="tm-textarea"
                style={{ ...s.formField, resize: "none" }}
              />

              {sendError && <p style={s.errorText}>{sendError}</p>}

              <button
                onClick={handleSend}
                disabled={sending}
                className="tm-send-btn"
                style={{ ...s.sendBtn, width: "100%", opacity: sending ? 0.5 : 1, marginTop: 4 }}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          )}

          {/* Inbox */}
          <div style={{ ...s.card, animation: "fadeUp 0.44s ease both", animationDelay: "0.08s" }}>
            <SectionLabel label="Inbox" />
            <div style={{ overflowY: "auto", maxHeight: 520, display: "flex", flexDirection: "column", gap: 0 }}>
              {loading ? (
                <p style={s.mutedText}>Loading…</p>
              ) : messages.length === 0 ? (
                <p style={s.mutedText}>No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <Teachermessage
                    key={msg.id}
                    title={msg.title}
                    message={msg.message}
                    senderName={msg.sent_by_name}
                    senderType={msg.sender_type}
                    date={msg.created_at}
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

const SectionLabel = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <div style={{ width: 3, height: 16, borderRadius: 2, background: `linear-gradient(to bottom, ${G[500]}, ${G[300]})`, flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: G[800], fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.1px" }}>
      {label}
    </span>
  </div>
)

const s = {
  page: { minHeight: "100vh", background: G[50], fontFamily: "'DM Sans', sans-serif", paddingBottom: 56 },
  inner: { maxWidth: 680, margin: "0 auto", padding: "32px 20px" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  bar: { width: 3, height: 22, borderRadius: 2, background: `linear-gradient(to bottom, ${G[500]}, ${G[300]})`, flexShrink: 0 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: G[900], fontFamily: "'DM Serif Display', serif" },

  card: {
    background: "#fff", borderRadius: 18,
    boxShadow: `0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px ${G[100]}`,
    padding: "24px 22px", marginBottom: 16,
  },

  formField: {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: "10px 14px", marginBottom: 12, borderRadius: 10,
    border: `1.5px solid ${G[200]}`, fontSize: 13, color: G[900],
    fontFamily: "'DM Sans', sans-serif", background: G[50],
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  sendBtn: {
    background: G[600], color: "#fff", border: "none",
    borderRadius: 10, padding: "10px 20px", fontSize: 13,
    fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer", transition: "background 0.2s",
  },
  cancelBtn: {
    background: G[50], color: G[700], border: `1.5px solid ${G[200]}`,
    borderRadius: 10, padding: "9px 20px", fontSize: 13,
    fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer", transition: "background 0.2s",
  },

  successBanner: {
    background: G[100], border: `1px solid ${G[300]}`,
    color: G[700], borderRadius: 10, padding: "10px 16px",
    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 },
  mutedText: { textAlign: "center", color: G[400], fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: "20px 0" },
}

export default TeacherMessagesMain