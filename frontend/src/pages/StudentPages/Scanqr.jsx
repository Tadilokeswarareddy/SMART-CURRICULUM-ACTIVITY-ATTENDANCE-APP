import React, { useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import StudentNav from "../../components/StudentNav"
import api from "../../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const Scanqr = () => {
  const scannerRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState("")

  const startCamera = async () => {
    if (isRunning) return
    const html5QrCode = new Html5Qrcode("qr-reader")
    scannerRef.current = html5QrCode
    setHasScanned(false); setStatusMessage("")
    try {
      await html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
        if (hasScanned) return
        setHasScanned(true); markAttendance(decodedText)
      })
      setIsRunning(true)
    } catch (err) {
      console.error("Camera error:", err); setStatusMessage("Could not access camera"); setStatusType("error")
    }
  }

  const stopCamera = async () => {
    try { if (scannerRef.current) await scannerRef.current.stop() } catch (err) { console.warn(err) }
    setIsRunning(false)
  }

  const markAttendance = async (qrToken) => {
    try {
      const res = await api.post("/api/attendance/mark/", { qr_token: qrToken })
      setStatusMessage(res.data.message); setStatusType("success"); stopCamera()
    } catch (err) {
      const msg = err.response?.data?.error || "Attendance failed"
      setStatusMessage(msg); setStatusType("error"); setHasScanned(false)
    }
  }

  return (
    <>
      <StudentNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 ${G[300]}} 50%{box-shadow:0 0 0 10px transparent} }
      `}</style>

      <div style={{ minHeight:"calc(100vh - 64px)", background:G[50], display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:20, boxShadow:`0 2px 24px rgba(0,0,0,0.09),0 0 0 1px ${G[100]}`, padding:"36px 32px", maxWidth:360, width:"100%", textAlign:"center", animation:"fadeUp 0.45s ease both" }}>
          {/* Title */}
          <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:24 }}>
            <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})` }} />
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:G[800], fontFamily:"'DM Serif Display',serif" }}>Scan Attendance QR</h2>
          </div>

          {/* Scanner box */}
          <div style={{ position:"relative", display:"inline-block", marginBottom:20 }}>
            <div id="qr-reader" style={{ width:260, height:200, background:"#111", borderRadius:14, overflow:"hidden",
              boxShadow: isRunning ? `0 0 0 3px ${G[400]},0 4px 20px rgba(0,0,0,0.3)` : `0 4px 20px rgba(0,0,0,0.15)`,
              transition:"box-shadow 0.3s", animation: isRunning ? "pulse 2s infinite" : "none",
            }} />
            {!isRunning && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:14, background:"rgba(0,0,0,0.5)" }}>
                <span style={{ fontSize:32 }}>📷</span>
              </div>
            )}
          </div>

          {/* Status */}
          {statusMessage && (
            <div style={{ padding:"10px 16px", borderRadius:10, marginBottom:20, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
              background: statusType==="success" ? G[50] : "#fef2f2",
              border: `1.5px solid ${statusType==="success" ? G[200] : "#fecaca"}`,
              color: statusType==="success" ? G[700] : "#dc2626",
            }}>
              {statusType==="success" ? "✓ " : "✕ "}{statusMessage}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={startCamera} disabled={isRunning}
              style={{ background:G[700], color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", opacity:isRunning?0.5:1, transition:"opacity 0.2s" }}>
              Start Scan
            </button>
            <button onClick={stopCamera} disabled={!isRunning}
              style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", opacity:!isRunning?0.5:1, transition:"opacity 0.2s" }}>
              Stop
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Scanqr