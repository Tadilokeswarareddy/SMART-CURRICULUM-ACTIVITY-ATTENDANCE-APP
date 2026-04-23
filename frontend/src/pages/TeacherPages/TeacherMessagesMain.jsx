import React, { useEffect, useState } from "react"
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

const TeacherMessagesMain = () => {
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [sections, setSections]     = useState([])
  const [form, setForm]             = useState({ title:"", message:"", target_section:"" })
  const [sending, setSending]       = useState(false)
  const [sendError, setSendError]   = useState("")
  const [sendSuccess, setSendSuccess] = useState("")

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

  const handleSend = async () => {
    if (!form.title || !form.message || !form.target_section) { setSendError("All fields are required"); return }
    setSending(true); setSendError(""); setSendSuccess("")
    try {
      await api.post("/api/messages/send/", { title:form.title, message:form.message, target_section:parseInt(form.target_section) })
      setForm({ title:"", message:"", target_section:"" })
      setShowForm(false); setSendSuccess("Message sent successfully!"); fetchMessages()
    } catch (err) { setSendError(err.response?.data?.error || "Failed to send message") }
    setSending(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .tm-field:focus { border-color:${G[400]}!important; box-shadow:0 0 0 3px ${G[100]}!important; outline:none; }
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
              onClick={() => { setShowForm(!showForm); setSendError(""); setSendSuccess("") }}
              style={{
                background: showForm ? G[50] : G[700],
                color: showForm ? G[700] : "#fff",
                border: showForm ? `1.5px solid ${G[200]}` : "none",
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
              <Heading label="Send Message to Section" />

              {[
                { tag:"select", value:form.target_section, onChange:e=>setForm({...form,target_section:e.target.value}), children: (
                  <>
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name} — {s.branch?.name}</option>)}
                  </>
                )},
              ].map((_, i) => null)}

              <select value={form.target_section} onChange={e => setForm({...form,target_section:e.target.value})}
                className="tm-field"
                style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"10px 14px", marginBottom:12, borderRadius:10, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50], transition:"border-color 0.2s,box-shadow 0.2s" }}>
                <option value="">Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name} — {s.branch?.name}</option>)}
              </select>

              <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}
                className="tm-field"
                style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"10px 14px", marginBottom:12, borderRadius:10, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50], transition:"border-color 0.2s,box-shadow 0.2s" }}/>

              <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form,message:e.target.value})} rows={4}
                className="tm-field"
                style={{ display:"block", width:"100%", boxSizing:"border-box", padding:"10px 14px", marginBottom:12, borderRadius:10, border:`1.5px solid ${G[200]}`, fontSize:13, color:G[900], fontFamily:"'DM Sans',sans-serif", background:G[50], resize:"none", transition:"border-color 0.2s,box-shadow 0.2s" }}/>

              {sendError && <p style={{ color:"#dc2626", fontSize:12, marginBottom:10 }}>{sendError}</p>}

              <button onClick={handleSend} disabled={sending}
                style={{ background:G[700], color:"#fff", border:"none", borderRadius:10, padding:"11px 0", fontSize:14, fontWeight:600, cursor:"pointer", width:"100%", opacity:sending?0.5:1, fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.2s" }}>
                {sending ? "Sending…" : "Send"}
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
                  <Teachermessage key={msg.id} title={msg.title} message={msg.message}
                    senderName={msg.sent_by_name} senderType={msg.sender_type} date={msg.created_at}/>
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