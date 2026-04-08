import React, { useState } from "react";

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
};

const SmartTask = ({ onStatsRefresh }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState({});

  const token = () => localStorage.getItem("access");

  const getTasks = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) { if (Array.isArray(data)) setTasks(data); else setError("Invalid response format."); }
      else setError(data?.detail || data?.error || "Failed to fetch tasks.");
    } catch { setError("Something went wrong while fetching tasks."); }
    setLoading(false);
  };

  const handleFileChange = (taskId, file) =>
    setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], file, score: null, reviewing: false } }));

  // Submit file to Gemini for scoring
  const handleSubmitAssignment = async (taskId) => {
    const sub = submissions[taskId];
    if (!sub?.file) { alert("Please upload a file before submitting."); return; }

    setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing: true, error: null } }));

    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("file", sub.file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/submit/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing: false, submitted: true, score: data.score } }));
        if (onStatsRefresh) onStatsRefresh(); // refresh stats widget
      } else {
        setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing: false, error: data.error || "Submission failed." } }));
      }
    } catch {
      setSubmissions(p => ({ ...p, [taskId]: { ...p[taskId], reviewing: false, error: "Network error." } }));
    }
  };

  const markDone = async (taskId) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/complete/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ task_id: taskId }),
      });
      const data = await res.json();
      if (res.ok) { setTasks(p => p.filter(t => t.id !== taskId)); if (onStatsRefresh) onStatsRefresh(); }
      else alert(data?.error || "Failed to complete task.");
    } catch { alert("Something went wrong."); }
  };

  const scoreColor = (s) => s >= 8 ? G[600] : s >= 5 ? "#d97706" : "#dc2626";
  const scoreBg   = (s) => s >= 8 ? G[100] : s >= 5 ? "#fef3c7" : "#fef2f2";
  const scoreBorder = (s) => s >= 8 ? G[200] : s >= 5 ? "#fde68a" : "#fecaca";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .st-hover:hover{box-shadow:0 8px 32px rgba(21,128,61,0.13)!important;transform:translateY(-2px)}
        .st-field:hover{border-color:${G[400]}!important;box-shadow:0 0 0 3px ${G[100]}!important}
        .st-file::file-selector-button{background:${G[700]};color:#fff;border:none;padding:6px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;margin-right:10px}
      `}</style>

      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>
        {/* Banner */}
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
          {loading && (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0" }}>
              <div style={{ width:44,height:44,borderRadius:"50%",border:`4px solid ${G[200]}`,position:"relative" }}>
                <div style={{ position:"absolute",inset:-4,borderRadius:"50%",border:"4px solid transparent",borderTop:`4px solid ${G[500]}`,animation:"spin 0.75s linear infinite" }}/>
              </div>
              <p style={{ color:G[600],marginTop:14,fontSize:14 }}>Generating tasks…</p>
            </div>
          )}

          {error && <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",color:"#dc2626",borderRadius:12,padding:"14px 18px",marginBottom:24,fontSize:14 }}>{error}</div>}

          {tasks.length === 0 && !loading && (
            <div style={{ background:"#fff",borderRadius:18,boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,padding:"56px 28px",textAlign:"center",animation:"fadeUp 0.5s ease both" }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:G[100],display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28 }}>📚</div>
              <h2 style={{ margin:"0 0 8px",fontSize:22,fontWeight:700,color:G[800],fontFamily:"'DM Serif Display',serif" }}>Generate your tasks</h2>
              <p style={{ margin:"0 0 28px",fontSize:14,color:"#6b7280",lineHeight:1.6 }}>Tasks that help you better understand what you learn in uni</p>
              <button onClick={getTasks} style={{ background:G[700],color:"#fff",border:"none",borderRadius:10,padding:"12px 28px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
                Generate 5 New Tasks
              </button>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {tasks.map((task, index) => {
              const sub = submissions[task.id] || {};
              return (
                <div key={task.id} className="st-hover" style={{ background:"#fff",borderRadius:18,boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,padding:"28px",animation:`fadeUp 0.4s ease both`,animationDelay:`${index*0.07}s`,transition:"box-shadow 0.2s,transform 0.2s" }}>
                  {/* Header */}
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                    <div style={{ width:32,height:32,borderRadius:9,background:G[100],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ fontSize:13,fontWeight:700,color:G[700] }}>{index+1}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                        <div style={{ width:3,height:18,borderRadius:2,background:`linear-gradient(to bottom,${G[500]},${G[300]})`,flexShrink:0 }}/>
                        <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:G[800] }}>{task.title || "Untitled Task"}</h3>
                      </div>
                      <span style={{ fontSize:12,color:G[600],fontWeight:500 }}>⏱ {task.duration||10} minutes</span>
                    </div>
                    {/* Score badge — shown after grading */}
                    {sub.score != null && (
                      <div style={{ background:scoreBg(sub.score),border:`1.5px solid ${scoreBorder(sub.score)}`,borderRadius:10,padding:"6px 14px",textAlign:"center",flexShrink:0 }}>
                        <div style={{ fontSize:18,fontWeight:700,color:scoreColor(sub.score),lineHeight:1 }}>{sub.score}</div>
                        <div style={{ fontSize:10,color:scoreColor(sub.score),fontWeight:600,marginTop:2 }}>/ 10</div>
                      </div>
                    )}
                  </div>

                  <p style={{ margin:"0 0 20px",fontSize:14,color:"#374151",lineHeight:1.7 }}>{task.description || "No description available."}</p>

                  {/* File upload */}
                  <div style={{ background:G[50],border:`1.5px solid ${G[200]}`,borderRadius:12,padding:16,marginBottom:14 }}>
                    <label style={{ display:"block",fontSize:10,fontWeight:700,color:G[600],textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:8 }}>
                      Upload Assignment File
                      <span style={{ marginLeft:6,fontWeight:400,color:"#9ca3af",textTransform:"none",letterSpacing:0 }}>(PNG, JPG, PDF, TXT)</span>
                    </label>
                    <input type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" className="st-file st-field" onChange={e => handleFileChange(task.id, e.target.files[0])}
                      style={{ width:"100%",fontSize:13,border:`1.5px solid ${G[200]}`,borderRadius:10,padding:"10px 14px",background:"#fff",boxSizing:"border-box",transition:"border-color 0.2s,box-shadow 0.2s" }}/>
                    {sub.file && <p style={{ marginTop:8,fontSize:12,color:G[600] }}>✓ {sub.file.name}</p>}
                  </div>

                  {/* Reviewing state */}
                  {sub.reviewing && (
                    <div style={{ background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#92400e",fontWeight:500 }}>
                      <div style={{ width:16,height:16,borderRadius:"50%",border:"2px solid #fcd34d",borderTop:"2px solid #d97706",animation:"spin 0.75s linear infinite",flexShrink:0 }}/>
                      Gemini is reviewing your submission…
                    </div>
                  )}

                  {/* Score result */}
                  {sub.submitted && sub.score != null && (
                    <div style={{ background:scoreBg(sub.score),border:`1.5px solid ${scoreBorder(sub.score)}`,borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13,fontWeight:600,color:scoreColor(sub.score) }}>
                      {sub.score >= 8 ? "🎉" : sub.score >= 5 ? "👍" : "💪"} Gemini scored your submission: <strong>{sub.score}/10</strong>
                    </div>
                  )}

                  {sub.error && (
                    <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",color:"#dc2626",borderRadius:10,padding:"10px 16px",fontSize:13,marginBottom:14 }}>{sub.error}</div>
                  )}

                  <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                    <button onClick={() => handleSubmitAssignment(task.id)} disabled={sub.reviewing}
                      style={{ background:sub.reviewing?G[300]:G[700],color:"#fff",border:"none",borderRadius:10,padding:"11px 22px",fontSize:14,fontWeight:600,cursor:sub.reviewing?"not-allowed":"pointer",transition:"background 0.2s" }}>
                      {sub.reviewing ? "Reviewing…" : sub.submitted ? "Resubmit" : "Submit for Grading"}
                    </button>
                    <button onClick={() => markDone(task.id)}
                      style={{ background:G[100],color:G[800],border:`1.5px solid ${G[200]}`,borderRadius:10,padding:"11px 22px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
                      Mark Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.length > 0 && (
            <div style={{ textAlign:"center",marginTop:32 }}>
              <button onClick={() => { setTasks([]); setSubmissions({}); }}
                style={{ background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer",textDecoration:"underline" }}>
                Clear all tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SmartTask;