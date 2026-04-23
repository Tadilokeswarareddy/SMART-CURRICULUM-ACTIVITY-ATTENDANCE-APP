import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",
}

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const SendRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const cleanedData = {
      username: username.trim().toLowerCase(),
      password: password.trim(),
    }

    try {
      const response = await api.post("/api/token/", cleanedData)

      localStorage.setItem(ACCESS_TOKEN, response.data.access)
      localStorage.setItem(REFRESH_TOKEN, response.data.refresh)

      const role = response.data.role
      if (role === "student") navigate("/studenthome")
      else if (role === "teacher") navigate("/teacherhome")
      else navigate("/admin")

    } catch {
      setError("Invalid username or password. Please try again.")
    }

    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .lp-input { border:none; border-bottom:1.5px solid ${G[200]}; padding:10px 0; width:100%; font-size:14px; font-family:'DM Sans',sans-serif; color:${G[900]}; background:transparent; outline:none; transition:border-color 0.2s; }
        .lp-input:focus { border-color:${G[500]}; }
        .lp-input::placeholder { color:#9ca3af; }
        .lp-btn:hover { background:${G[800]} !important; }
        .lp-eye:hover { color:${G[600]} !important; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:G[50], padding:16, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:"100%", maxWidth:860, background:"#fff", borderRadius:24, boxShadow:"0 8px 40px rgba(0,0,0,0.1)", overflow:"hidden", display:"flex", minHeight:500, animation:"fadeUp 0.5s ease both" }}>

          <div style={{ flex:"0 0 45%", background:`linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", position:"relative", overflow:"hidden" }}
            className="lp-left">
            <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", bottom:20, left:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
            <h1 style={{ margin:"0 0 8px", fontSize:32, fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif", letterSpacing:"-0.5px", position:"relative", zIndex:1 }}>Shusseki</h1>
            <p style={{ margin:"0 0 28px", fontSize:13, color:G[300], fontFamily:"'DM Sans',sans-serif", textAlign:"center", position:"relative", zIndex:1 }}>Smart Attendance &amp; Curriculum Management</p>
            <div style={{ width:180, height:180, borderRadius:18, background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
              <img src="/classbro.svg" alt="login" style={{ width:"80%", height:"80%", objectFit:"contain" }} />
            </div>
          </div>

          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 40px" }}>
            <div style={{ animation:"fadeUp 0.5s ease both", animationDelay:"0.1s" }}>
              <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:700, color:G[900], fontFamily:"'DM Serif Display',serif" }}>
                Welcome to <span style={{ color:G[600] }}>Shusseki</span>
              </h2>
              <p style={{ margin:"0 0 36px", fontSize:13, color:"#9ca3af", fontFamily:"'DM Sans',sans-serif" }}>Sign in to continue</p>

              <form onSubmit={SendRequest} style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Username</label>
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="username"
                    spellCheck="false"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="lp-input"
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Password</label>
                  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="lp-input"
                      style={{ paddingRight:28 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="lp-eye"
                      style={{ position:"absolute", right:0, background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:0, display:"flex", alignItems:"center", transition:"color 0.2s" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {error && (
                  <p style={{ margin:0, fontSize:12, color:"#dc2626", fontFamily:"'DM Sans',sans-serif" }}>
                    ⚠️ {error}
                  </p>
                )}

                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:12, color:G[600], cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Forgot password?</span>
                </div>

                <button type="submit" disabled={loading} className="lp-btn"
                  style={{ background:G[800], color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"background 0.2s", opacity:loading?0.7:1 }}>
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .lp-left { display: none !important; } }
      `}</style>
    </>
  )
}

export default LoginPage