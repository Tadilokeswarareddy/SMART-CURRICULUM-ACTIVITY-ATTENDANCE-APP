import React, { useState, useEffect } from "react";

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
};

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const SmartTask = ({ onStatsRefresh }) => {
  const [subjects, setSubjects]           = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);

  const [tasks, setTasks]                 = useState({});        
  const [loadingTasks, setLoadingTasks]   = useState({});        
  const [taskError, setTaskError]         = useState({});        
  const [geminiWarn, setGeminiWarn]       = useState({});        
  const [submissions, setSubmissions]     = useState({});        

  useEffect(() => {
    fetch(`${API}/api/task/section-task/active/`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubjects(data)
          if (data.length > 0) setActiveSubject(data[0].subject_id)
        }
      })
      .catch(console.error)
      .finally(() => setSubjectsLoading(false))
  }, [])

  const getTasks = async (subjectId) => {
    setLoadingTasks(p => ({ ...p, [subjectId]: true }))
    setTaskError(p => ({ ...p, [subjectId]: "" }))
    setGeminiWarn(p => ({ ...p, [subjectId]: false }))
    try {
      const res = await fetch(`${API}/api/task/generate/`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
        body: JSON.stringify({ subject_id: subjectId }),
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        if (data[0]?.is_fallback) setGeminiWarn(p => ({ ...p, [subjectId]: true }))
        setTasks(p => ({ ...p, [subjectId]: data }))
        const restored = {}
        data.forEach(t => { if (t.saved_score != null) restored[t.id] = { submitted:true, score:t.saved_score } })
        setSubmissions(p => ({ ...p, ...restored }))
      } else {
        setTaskError(p => ({ ...p, [subjectId]: data?.error || "Failed to fetch tasks." }))
      }
    } catch {
      setTaskError(p => ({ ...p, [subjectId]: "Something went wrong." }))
    }
    setLoadingTasks(p => ({ ...p, [subjectId]: false }))
  }

  const handleFilesChange = (taskId, files) => {
    setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], files: Array.from(files), error:null } }))
  }

  const handleSubmit = async (taskId) => {
    const sub = submissions[taskId]
    if (!sub?.files?.length) { alert("Please upload at least one file."); return }
    setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing:true, error:null } }))
    const formData = new FormData()
    formData.append("task_id", taskId)
    sub.files.forEach(f => formData.append("files", f))
    try {
      const res = await fetch(`${API}/api/task/submit/`, {
        method:"POST", headers:{ Authorization:`Bearer ${token()}` }, body:formData,
      })
      const data = await res.json()
      if (res.ok) {
        setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing:false, submitted:true, score:data.score, remark:data.remark } }))
        if (onStatsRefresh) onStatsRefresh()
      } else {
        setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing:false, error: data.gemini_error ? "Gemini is not responding. Try again in a moment." : (data.error||"Submission failed.") } }))
      }
    } catch {
      setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing:false, error:"Network error." } }))
    }
  }

  const markDone = async (taskId, subjectId) => {
    try {
      const res = await fetch(`${API}/api/task/complete/`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (res.ok) {
        setTasks(p => ({ ...p, [subjectId]: (p[subjectId]||[]).filter(t => t.id !== taskId) }))
        setSubmissions(p => { const n={...p}; delete n[taskId]; return n })
        if (onStatsRefresh) onStatsRefresh()
      }
    } catch { alert("Something went wrong.") }
  }

  const scoreColor  = s => s >= 8 ? G[600] : s >= 5 ? "#d97706" : "#dc2626"
  const scoreBg     = s => s >= 8 ? G[100]  : s >= 5 ? "#fef3c7" : "#fef2f2"
  const scoreBorder = s => s >= 8 ? G[200]  : s >= 5 ? "#fde68a" : "#fecaca"

  const activeTasks = activeSubject ? (tasks[activeSubject] || []) : []
  const isLoading   = activeSubject ? !!loadingTasks[activeSubject] : false
  const error       = activeSubject ? (taskError[activeSubject] || "") : ""
  const hasWarn     = activeSubject ? !!geminiWarn[activeSubject] : false
  const hasGenerated = activeSubject ? !!tasks[activeSubject] : false

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .st-hover:hover{box-shadow:0 8px 32px rgba(21,128,61,0.13)!important;transform:translateY(-2px)}
        .st-file::file-selector-button{background:${G[700]};color:#fff;border:none;padding:6px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;margin-right:10px}
        .subj-tab:hover{border-color:${G[400]}!important;color:${G[700]}!important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ position:"relative", background:`linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`, paddingTop:76, paddingBottom:68, overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-70,right:-70,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
          <div style={{ maxWidth:820, margin:"0 auto", padding:"0 28px", position:"relative", zIndex:1, animation:"fadeUp 0.45s ease both" }}>
            <span style={{ display:"block",fontSize:11,fontWeight:700,color:G[300],letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:6 }}>Curriculum</span>
            <h1 style={{ margin:"0 0 10px",fontSize:30,fontWeight:700,color:"#fff",fontFamily:"'DM Serif Display',serif",lineHeight:1.15 }}>Smart Student Tasks</h1>
            <span style={{ display:"inline-block",background:"rgba(255,255,255,0.14)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.22)",color:"#fff",borderRadius:999,padding:"4px 14px",fontSize:13,fontWeight:600 }}>AI-Powered Learning</span>
          </div>
          <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:56,display:"block" }} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]}/>
          </svg>
        </div>

        <div style={{ maxWidth:820, margin:"0 auto", padding:"32px 24px 56px" }}>

          {subjectsLoading ? (
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <div style={{ width:18,height:18,borderRadius:"50%",border:`3px solid ${G[200]}`,borderTop:`3px solid ${G[500]}`,animation:"spin 0.75s linear infinite" }}/>
              <span style={{ color:"#9ca3af", fontSize:13 }}>Loading subjects…</span>
            </div>
          ) : subjects.length === 0 ? (
            <div style={{ background:"#fff",borderRadius:18,boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,padding:"48px 28px",textAlign:"center",animation:"fadeUp 0.5s ease both" }}>
              <p style={{ fontSize:14, color:"#9ca3af", margin:0 }}>No subjects with active task prompts yet. Your teacher hasn't set any tasks.</p>
            </div>
          ) : (
            <>

              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
                {subjects.map(s => {
                  const active = activeSubject === s.subject_id
                  return (
                    <button key={s.subject_id} className={active ? "" : "subj-tab"}
                      onClick={() => setActiveSubject(s.subject_id)}
                      style={{
                        padding:"8px 20px", borderRadius:999, fontSize:13, fontWeight:700,
                        border:`1.5px solid ${active ? G[700] : G[200]}`,
                        background: active ? G[700] : "#fff",
                        color: active ? "#fff" : G[600],
                        cursor:"pointer", transition:"all 0.2s",
                        fontFamily:"'DM Sans',sans-serif",
                      }}>
                      {s.subject}
                      <span style={{ marginLeft:6, fontSize:11, opacity:0.75, fontWeight:500 }}>{s.subject_code}</span>
                    </button>
                  )
                })}
              </div>


              {hasWarn && (
                <div style={{ background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"14px 18px",marginBottom:24,display:"flex",alignItems:"flex-start",gap:12 }}>
                  <span style={{ fontSize:18,flexShrink:0,marginTop:1 }}></span>
                  <div>
                    <p style={{ margin:"0 0 2px",fontSize:14,fontWeight:700,color:"#92400e" }}>Gemini is not responding</p>
                    <p style={{ margin:0,fontSize:13,color:"#b45309",lineHeight:1.5 }}>These are default tasks. Your work will still be graded normally once Gemini comes back online.</p>
                  </div>
                </div>
              )}


              {error && (
                <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",color:"#dc2626",borderRadius:12,padding:"14px 18px",marginBottom:24,fontSize:14 }}>{error}</div>
              )}

   
              {isLoading && (
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0" }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",border:`4px solid ${G[200]}`,position:"relative" }}>
                    <div style={{ position:"absolute",inset:-4,borderRadius:"50%",border:"4px solid transparent",borderTop:`4px solid ${G[500]}`,animation:"spin 0.75s linear infinite" }}/>
                  </div>
                  <p style={{ color:G[600],marginTop:14,fontSize:14 }}>Generating tasks…</p>
                </div>
              )}


              {!isLoading && !hasGenerated && (
                <div style={{ background:"#fff",borderRadius:18,boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,padding:"56px 28px",textAlign:"center",animation:"fadeUp 0.5s ease both" }}>
                  <div style={{ width:64,height:64,borderRadius:"50%",background:G[100],display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",border:`2px solid ${G[200]}` }}>
                    <img src="/pad.svg" alt="" style={{ width:28,height:28,objectFit:"contain" }}/>
                  </div>
                  <h2 style={{ margin:"0 0 8px",fontSize:22,fontWeight:700,color:G[800],fontFamily:"'DM Serif Display',serif" }}>
                    Generate tasks for {subjects.find(s => s.subject_id === activeSubject)?.subject}
                  </h2>
                  <p style={{ margin:"0 0 28px",fontSize:14,color:"#6b7280",lineHeight:1.6 }}>
                    Tasks set by your teacher, personalised by AI
                  </p>
                  <button onClick={() => getTasks(activeSubject)}
                    style={{ background:G[700],color:"#fff",border:"none",borderRadius:10,padding:"12px 28px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
                    Generate 5 Tasks
                  </button>
                </div>
              )}

              {!isLoading && hasGenerated && activeTasks.length === 0 && (
                <div style={{ background:"#fff",borderRadius:18,padding:"40px 28px",textAlign:"center",boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}` }}>
                  <p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>All tasks completed for this subject!</p>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                {activeTasks.map((task, index) => {
                  const sub = submissions[task.id] || {}
                  return (
                    <div key={task.id} className="st-hover"
                      style={{ background:"#fff",borderRadius:18,boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,padding:"28px",animation:`fadeUp 0.4s ease both`,animationDelay:`${index*0.07}s`,transition:"box-shadow 0.2s,transform 0.2s" }}>

                      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                        <div style={{ width:32,height:32,borderRadius:9,background:G[100],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <span style={{ fontSize:13,fontWeight:700,color:G[700] }}>{index+1}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                            <div style={{ width:3,height:18,borderRadius:2,background:`linear-gradient(to bottom,${G[500]},${G[300]})`,flexShrink:0 }}/>
                            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:G[800] }}>{task.title}</h3>
                          </div>
                          <span style={{ fontSize:12,color:G[600],fontWeight:500 }}>{task.duration||20} minutes</span>
                        </div>
                        {sub.score != null && (
                          <div style={{ background:scoreBg(sub.score),border:`1.5px solid ${scoreBorder(sub.score)}`,borderRadius:10,padding:"6px 14px",textAlign:"center",flexShrink:0 }}>
                            <div style={{ fontSize:18,fontWeight:700,color:scoreColor(sub.score),lineHeight:1 }}>{sub.score}</div>
                            <div style={{ fontSize:10,color:scoreColor(sub.score),fontWeight:600,marginTop:2 }}>/10</div>
                          </div>
                        )}
                      </div>

                      <p style={{ margin:"0 0 20px",fontSize:14,color:"#374151",lineHeight:1.7 }}>{task.description}</p>

                      <div style={{ background:G[50],border:`1.5px solid ${G[200]}`,borderRadius:12,padding:16,marginBottom:14 }}>
                        <label style={{ display:"block",fontSize:10,fontWeight:700,color:G[600],textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:8 }}>
                          Upload Assignment Files
                          <span style={{ marginLeft:6,fontWeight:400,color:"#9ca3af",textTransform:"none",letterSpacing:0 }}>(PNG, JPG, PDF, TXT)</span>
                        </label>
                        <input type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" multiple className="st-file"
                          onChange={e => handleFilesChange(task.id, e.target.files)}
                          style={{ width:"100%",fontSize:13,border:`1.5px solid ${G[200]}`,borderRadius:10,padding:"10px 14px",background:"#fff",boxSizing:"border-box" }}
                        />
                        {sub.files?.length > 0 && (
                          <div style={{ marginTop:10,display:"flex",flexDirection:"column",gap:4 }}>
                            {sub.files.map((f,i) => <p key={i} style={{ margin:0,fontSize:12,color:G[600] }}>✓ {f.name}</p>)}
                          </div>
                        )}
                      </div>

                      {sub.reviewing && (
                        <div style={{ background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#92400e",fontWeight:500 }}>
                          <div style={{ width:16,height:16,borderRadius:"50%",border:"2px solid #fcd34d",borderTop:"2px solid #d97706",animation:"spin 0.75s linear infinite",flexShrink:0 }}/>
                          Reviewing your submission…
                        </div>
                      )}

                      {sub.submitted && sub.score != null && (
                        <div style={{ background:scoreBg(sub.score),border:`1.5px solid ${scoreBorder(sub.score)}`,borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13,fontWeight:600,color:scoreColor(sub.score) }}>
                          Scored: <strong>{sub.score}/10</strong>
                          {sub.remark && <span style={{ fontWeight:500,marginLeft:8,fontSize:12,opacity:0.85 }}>— {sub.remark}</span>}
                        </div>
                      )}

                      {sub.error && (
                        <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"12px 16px",marginBottom:14 }}>
                          <p style={{ margin:"0 0 2px",fontSize:13,fontWeight:700,color:"#dc2626" }}>Submission Failed</p>
                          <p style={{ margin:0,fontSize:13,color:"#dc2626" }}>{sub.error}</p>
                        </div>
                      )}

                      <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                        <button onClick={() => handleSubmit(task.id)} disabled={sub.reviewing}
                          style={{ background:sub.reviewing?G[300]:G[700],color:"#fff",border:"none",borderRadius:10,padding:"11px 22px",fontSize:14,fontWeight:600,cursor:sub.reviewing?"not-allowed":"pointer" }}>
                          {sub.reviewing ? "Reviewing…" : sub.submitted ? "Resubmit" : "Submit for Grading"}
                        </button>
                        <button onClick={() => markDone(task.id, activeSubject)}
                          style={{ background:G[100],color:G[800],border:`1.5px solid ${G[200]}`,borderRadius:10,padding:"11px 22px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
                          Mark Done 
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SmartTask