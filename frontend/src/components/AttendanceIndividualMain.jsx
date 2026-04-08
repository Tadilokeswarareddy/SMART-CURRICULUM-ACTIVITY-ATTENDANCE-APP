import React, { useEffect, useState } from "react"
import AttendanceIndividual from "./AttendanceIndividual"
import { Link } from "react-router-dom"
import api from "../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const AttendanceIndividualMain = () => {
  const [subjects, setSubjects] = useState([])
  const [overall, setOverall] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/attendance/student/")
      .then((res) => { setSubjects(res.data.subjects); setOverall(res.data.overall_percentage); setLoading(false) })
      .catch((err) => { console.error(err); setLoading(false) })
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>
      <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"24px 22px", width:"100%", maxWidth:520, fontFamily:"'DM Sans',sans-serif" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>Attendance</h2>
        </div>

        <div style={{ maxHeight:320, overflowY:"auto", paddingRight:4 }}>
          {loading ? (
            <p style={{ textAlign:"center", color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>Loading…</p>
          ) : subjects.length === 0 ? (
            <p style={{ textAlign:"center", color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>No attendance records yet.</p>
          ) : (
            subjects.map((item) => (
              <AttendanceIndividual
                key={item.subject_code}
                subject={item.subject_name}
                presentClasses={item.present}
                totalClasses={item.total}
                teacherName={item.teacher_name}
                courseCode={item.subject_code}
                syllabusUrl={item.syllabus_pdf || null}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", marginTop:16, paddingTop:14, borderTop:`1px solid ${G[100]}` }}>
          <p style={{ margin:0, fontSize:14, fontWeight:500, color:G[900], fontFamily:"'DM Sans',sans-serif" }}>
            Total: <span style={{ color:G[600], fontWeight:700 }}>{overall}%</span>
          </p>
          <Link to="/scanqr" style={{ marginLeft:"auto", background:G[700], color:"#fff", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
            Scan QR
          </Link>
        </div>
      </div>
    </>
  )
}

export default AttendanceIndividualMain