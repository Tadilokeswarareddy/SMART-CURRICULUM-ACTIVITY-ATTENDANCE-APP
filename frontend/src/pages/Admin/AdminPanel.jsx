
import { useEffect, useState, useCallback } from "react"
import api from "../../api"

import { G, Icon, Toast, Spinner, s } from "./components/Shared"

import Dashboard   from "./pages/Dashboard"
import Teachers    from "./pages/Teachers"
import Students    from "./pages/Students"
import Branches    from "./pages/Branches"
import Years       from "./pages/Years"
import Sections    from "./pages/Sections"
import Subjects    from "./pages/Subjects"
import Assignments from "./pages/Assignments"
import Timetable   from "./pages/Timetable"
import Messages    from "./pages/Messages"
import Users       from "./pages/Users"


const NAV = [
  { id: "dashboard",   icon: "dashboard",   label: "Dashboard"   },
  { id: "users",       icon: "users",       label: "Users"       },
  { id: "teachers",    icon: "teachers",    label: "Teachers"    },
  { id: "students",    icon: "students",    label: "Students"    },
  { id: "branches",    icon: "branches",    label: "Branches"    },
  { id: "years",       icon: "years",       label: "Years"       },
  { id: "sections",    icon: "sections",    label: "Sections"    },
  { id: "subjects",    icon: "subjects",    label: "Subjects"    },
  { id: "assignments", icon: "assignments", label: "Assignments" },
  { id: "timetable",   icon: "timetable",   label: "Timetable"   },
  { id: "messages",    icon: "messages",    label: "Messages"    },
]

const ENDPOINTS = [
  ["/api/branches/",       "branches"],
  ["/api/years/",          "years"],
  ["/api/sections/",       "sections"],
  ["/api/subjects/",       "subjects"],
  ["/api/assignments/",    "assignments"],
  ["/api/messages/inbox/", "messages"],
  ["/api/students/",       "students"],
  ["/api/teachers/",       "teachers"],
  ["/api/timetable/",      "timetable"],
  ["/api/register/",       "users"],   
]

const AdminPanel = () => {
  const [page, setPage]       = useState("dashboard")
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState(null)

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.all(ENDPOINTS.map(([url]) => api.get(url)))
      const nextData = {}
      ENDPOINTS.forEach(([, key], i) => { nextData[key] = results[i].data })
      setData(nextData)
    } catch {
      showToast("Failed to load data — make sure you are logged in as admin")
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const pageProps = { data, reload: load, toast: showToast }

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <Dashboard   {...pageProps} />
      case "users":       return <Users       {...pageProps} />
      case "teachers":    return <Teachers    {...pageProps} />
      case "students":    return <Students    {...pageProps} />
      case "branches":    return <Branches    {...pageProps} />
      case "years":       return <Years       {...pageProps} />
      case "sections":    return <Sections    {...pageProps} />
      case "subjects":    return <Subjects    {...pageProps} />
      case "assignments": return <Assignments {...pageProps} />
      case "timetable":   return <Timetable   {...pageProps} />
      case "messages":    return <Messages    {...pageProps} />
      default:            return <Dashboard   {...pageProps} />
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${G[50]}; }
        .ap-nav:hover  { background: ${G[50]} !important; color: ${G[800]} !important; }
        .ap-nav.active { background: ${G[100]} !important; color: ${G[800]} !important; }
        tbody tr:hover td { background: ${G[50]}; }
        .ap-page { animation: fadeUp 0.28s ease both; }
      `}</style>

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={s.logo}>Shusseki</span>
          <span style={s.adminTag}>ADMIN</span>
        </div>
        <span style={{ fontSize: 12, color: G[500], fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>
          <div style={{ fontSize: 10, fontWeight: 700, color: G[400], letterSpacing: "2px", textTransform: "uppercase", padding: "2px 12px 10px", fontFamily: "'DM Sans',sans-serif" }}>
            Menu
          </div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`ap-nav${page === n.id ? " active" : ""}`}
              onClick={() => setPage(n.id)}
              style={s.navBtn}
            >
              <span style={{ color: page === n.id ? G[600] : G[400], flexShrink: 0 }}>
                <Icon name={n.icon} size={15} />
              </span>
              {n.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1px solid ${G[100]}`, paddingTop: 12, marginTop: 8 }}>
            <a href="/logout" style={{ ...s.navBtn, display: "flex", textDecoration: "none", color: "#dc2626" }}>
              <span style={{ color: "#fca5a5", flexShrink: 0 }}><Icon name="logout" size={15} /></span>
              Logout
            </a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={s.main}>
          <div className="ap-page">{renderPage()}</div>
        </main>
      </div>

      <Toast msg={toast} />
    </>
  )
}

export default AdminPanel