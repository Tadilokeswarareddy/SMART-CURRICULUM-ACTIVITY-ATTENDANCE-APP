import React from "react"
import { useNavigate } from "react-router-dom"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",
}

const ForgotPassword = () => {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fp-btn:hover { background:${G[800]} !important; }
        .fp-mail:hover { color:${G[800]} !important; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:G[50], padding:16, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:"100%", maxWidth:460, background:"#fff", borderRadius:24, boxShadow:"0 8px 40px rgba(0,0,0,0.1)", padding:"48px 40px", animation:"fadeUp 0.5s ease both", textAlign:"center" }}>

          <div style={{ width:64, height:64, borderRadius:"50%", background:G[100], border:`2px solid ${G[200]}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>

          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:700, color:G[900], fontFamily:"'DM Serif Display',serif" }}>
            Forgot your password?
          </h2>
          <p style={{ margin:"0 0 28px", fontSize:13, color:"#6b7280", lineHeight:1.6 }}>
            No worries. Contact your administrator and they'll reset it for you.
          </p>

          <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:14, padding:"20px 24px", marginBottom:28 }}>
            <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px" }}>Admin Contact</p>
            <a
              href="mailto:lokeshreddytadi@gmail.com"
              className="fp-mail"
              style={{ fontSize:14, fontWeight:600, color:G[700], textDecoration:"none", transition:"color 0.2s" }}
            >
              lokeshreddytadi@gmail.com
            </a>
          </div>

          <p style={{ margin:"0 0 28px", fontSize:12, color:"#9ca3af", lineHeight:1.6 }}>
            Include your username in the email so the admin can identify your account quickly.
          </p>

          <button
            onClick={() => navigate("/")}
            className="fp-btn"
            style={{ width:"100%", background:G[700], color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:14, fontWeight:600, cursor:"pointer", transition:"background 0.2s" }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword