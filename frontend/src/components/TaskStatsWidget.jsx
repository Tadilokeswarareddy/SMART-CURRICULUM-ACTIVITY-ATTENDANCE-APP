import React, { useEffect, useState, useCallback } from "react"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",
}

const TaskStatsWidget = ({ refreshTrigger }) => {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/task/stats/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats, refreshTrigger])

  const score = stats?.average_score
  const scoreColor  = score == null ? G[600]  : score >= 8 ? G[700]    : score >= 5 ? "#d97706"  : "#dc2626"
  const scoreBg     = score == null ? G[50]   : score >= 8 ? G[50]     : score >= 5 ? "#fffbeb"  : "#fff5f5"
  const scoreBorder = score == null ? G[200]  : score >= 8 ? G[200]    : score >= 5 ? "#fde68a"  : "#fecaca"
  const scoreOpacity = score == null ? 1 : score >= 8 ? 1 : score >= 5 ? 0.85 : 0.75

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background:"#fff", borderRadius:16, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"24px", fontFamily:"'DM Sans',sans-serif" }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:G[800] }}>Task Performance</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>AI-graded submissions</div>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", border:`3px solid ${G[200]}`, borderTop:`3px solid ${G[500]}`, animation:"spin 0.75s linear infinite" }}/>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ background:scoreBg, border:`1.5px solid ${scoreBorder}`, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:600, color:scoreColor, lineHeight:1, opacity:scoreOpacity, letterSpacing:"-0.5px" }}>
                {score != null ? score : "—"}
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:scoreColor, marginTop:3, opacity:0.7 }}>
                {score != null ? "/ 10" : "No submissions"}
              </div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:6, fontWeight:500 }}>Average Score</div>
            </div>
            <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:600, color:G[700], lineHeight:1, letterSpacing:"-0.5px" }}>
                {stats?.completed_tasks ?? "—"}
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:G[600], marginTop:3, opacity:0.7 }}>tasks</div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:6, fontWeight:500 }}>Completed</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default TaskStatsWidget