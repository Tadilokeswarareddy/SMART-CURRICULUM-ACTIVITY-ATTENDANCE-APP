import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",
}

const NAV_LINKS = [
  { to: "/teacherhome",      label: "HOME" },
  { to: "/markattendance",   label: "ATTENDANCE" },
  { to: "/teachertimetable", label: "TIME TABLE" },
  { to: "/teachermessages",  label: "MESSAGES" },
  { to: "/teacherprofile",   label: "PROFILE" },
]

const TeacherNav = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        .tn-link { position:relative; }
        .tn-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px;
          background:${G[500]}; border-radius:2px; transition:width 0.2s; }
        .tn-link:hover::after, .tn-link.active::after { width:100%; }
        .tn-hamburger:hover { background:${G[100]} !important; }
        .tn-mobile-link:hover { background:${G[50]} !important; }
        @media (min-width:768px){ .tn-hide-mob{display:flex!important} .tn-show-mob{display:none!important} }
        @media (max-width:767px){ .tn-hide-mob{display:none!important} .tn-show-mob{display:block!important} }
      `}</style>

      <header style={{
        width:"100%", background:"#fff",
        borderBottom:`1px solid ${G[100]}`,
        fontFamily:"'DM Sans',sans-serif",
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 1px 8px rgba(21,128,61,0.07)",
      }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", height:64, maxWidth:1200, margin:"0 auto",
        }}>

          {/* Logo */}
          <Link to="/teacherhome" style={{ textDecoration:"none" }}>
            <span style={{
              fontSize:22, fontWeight:700, color:G[700],
              fontFamily:"'DM Serif Display',serif", letterSpacing:"-0.5px",
            }}>Shusseki</span>
          </Link>

          {/* Desktop nav pill */}
          <nav className="tn-hide-mob" style={{
            display:"flex", alignItems:"center",
            background:G[50], border:`1.5px solid ${G[100]}`,
            borderRadius:999, padding:"0 8px", height:44,
          }}>
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className={`tn-link${active ? " active" : ""}`}
                  style={{
                    padding:"0 16px", fontSize:11, fontWeight:700,
                    letterSpacing:"1.5px",
                    color: active ? G[700] : G[600],
                    textDecoration:"none", lineHeight:"44px",
                    transition:"color 0.2s",
                  }}>
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop logout */}
          <Link to="/logout" className="tn-hide-mob" style={{
            background:G[700], color:"#fff", borderRadius:10,
            padding:"8px 20px", fontSize:13, fontWeight:600,
            fontFamily:"'DM Sans',sans-serif", textDecoration:"none",
            transition:"background 0.2s",
          }}>
            Logout
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className="tn-hamburger tn-show-mob"
            style={{
              background:"none", border:`1.5px solid ${G[200]}`,
              borderRadius:9, padding:"6px 11px",
              color:G[700], fontSize:18, cursor:"pointer",
              lineHeight:1, transition:"background 0.2s",
              fontFamily:"'DM Sans',sans-serif",
            }}>
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            background:"#fff", borderTop:`1px solid ${G[100]}`,
            padding:"8px 0 14px",
          }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="tn-mobile-link"
                style={{
                  display:"block", padding:"12px 28px",
                  fontSize:12, fontWeight:700, letterSpacing:"1.5px",
                  color:G[700], textDecoration:"none",
                  transition:"background 0.15s",
                }}>
                {label}
              </Link>
            ))}
            <Link to="/logout" onClick={() => setOpen(false)} style={{
              display:"block", padding:"12px 28px",
              fontSize:12, fontWeight:700, letterSpacing:"1.5px",
              color:"#dc2626", textDecoration:"none",
            }}>
              LOGOUT
            </Link>
          </div>
        )}
      </header>
    </>
  )
}

export default TeacherNav