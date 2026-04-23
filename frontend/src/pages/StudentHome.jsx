import React from "react"
import StudentNav from "../components/StudentNav"
import StudentMessageMain from "../components/StudentMessageMain"
import AttendanceIndividualMain from "../components/AttendanceIndividualMain"
import TaskStatsWidget from "../components/TaskStatsWidget"

const G = { 50:"#f0fdf4",100:"#dcfce7",500:"#22c55e",700:"#15803d" }

const StudentHome = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>
        <StudentNav />
        <div style={{ background:`linear-gradient(135deg,${G[700]} 0%,${G[500]} 100%)`, padding:"20px 24px", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:13, color:G[100], fontWeight:500, letterSpacing:"0.5px" }}>Good day! Here's your overview</p>
        </div>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 20px 56px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:28 }}>
          <div style={{ animation:"fadeUp 0.45s ease both" }}>
            <AttendanceIndividualMain />
          </div>
          <div style={{ animation:"fadeUp 0.45s ease both", animationDelay:"0.1s" }}>
            <TaskStatsWidget />
          </div>
          <div style={{ animation:"fadeUp 0.45s ease both", animationDelay:"0.2s" }}>
            <StudentMessageMain />
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentHome