// src/pages/admin/components/shared.jsx
// ─── Shared design tokens, icons, and UI primitives ───────────────────────────

export const G = {
  50:  "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
  400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
  800: "#166534", 900: "#14532d",
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard:   <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    teachers:    <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    students:    <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
    branches:    <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>,
    years:       <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    sections:    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    subjects:    <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    assignments: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    timetable:   <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
    messages:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    users:       <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    logout:      <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit:        <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:       <><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    search:      <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    close:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check:       <><polyline points="20,6 9,17 4,12"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
export const s = {
  header:     { background: "#fff", borderBottom: `1px solid ${G[100]}`, padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 1px 0 ${G[100]}` },
  logo:       { fontSize: 21, fontWeight: 700, color: G[700], fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.3px" },
  adminTag:   { fontSize: 10, fontWeight: 700, background: G[100], color: G[700], borderRadius: 5, padding: "3px 8px", letterSpacing: "1.5px", fontFamily: "'DM Sans',sans-serif" },
  sidebar:    { width: 210, background: "#fff", borderRight: `1px solid ${G[100]}`, padding: "16px 8px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 },
  navBtn:     { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: G[600], textAlign: "left", width: "100%", transition: "background 0.12s, color 0.12s" },
  main:       { flex: 1, padding: "28px 32px 56px", overflowY: "auto", background: G[50] },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 },
  statCard:   { background: "#fff", borderRadius: 12, padding: "18px 20px", border: `1px solid ${G[100]}` },
  card:       { background: "#fff", borderRadius: 14, padding: "22px 24px", border: `1px solid ${G[100]}`, marginBottom: 20 },
  th:         { textAlign: "left", fontSize: 10, fontWeight: 700, color: G[500], textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 14px 10px", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" },
  input:      { padding: "9px 13px", border: `1.5px solid ${G[200]}`, borderRadius: 9, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G[900], background: G[50], outline: "none", transition: "border 0.15s, box-shadow 0.15s", width: "100%" },
  fieldLabel: { fontSize: 10, fontWeight: 700, color: G[600], textTransform: "uppercase", letterSpacing: "1.2px", fontFamily: "'DM Sans',sans-serif" },
  formRow:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  btn:        { padding: "8px 18px", borderRadius: 9, border: `1.5px solid ${G[200]}`, background: "#fff", color: G[700], fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  btnPrimary: { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${G[700]}`, background: G[700], color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  btnSm:      { display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, border: `1px solid ${G[200]}`, background: G[50], color: G[700], fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  btnDanger:  { display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  iconBtn:    { background: G[50], border: `1px solid ${G[200]}`, borderRadius: 7, padding: "5px 9px", cursor: "pointer", color: G[600], display: "flex", alignItems: "center", justifyContent: "center" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal:      { background: "#fff", borderRadius: 16, padding: "26px 28px", width: 500, maxWidth: "95vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" },
  toast:      { position: "fixed", bottom: 24, right: 24, background: G[800], color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 6px 20px rgba(0,0,0,0.16)", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 0.25s ease" },
  centered:   { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: G[50] },
  spinRing:   { width: 40, height: 40, borderRadius: "50%", border: `3px solid ${G[200]}`, position: "relative" },
  spinArc:    { position: "absolute", inset: -3, borderRadius: "50%", border: "3px solid transparent", borderTopColor: G[500], animation: "spin 0.7s linear infinite" },
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export const Toast = ({ msg }) => msg ? (
  <div style={s.toast}><Icon name="check" size={13} />{msg}</div>
) : null

// ── Spinner ────────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={s.centered}>
      <div style={s.spinRing}><div style={s.spinArc} /></div>
      <p style={{ color: G[600], marginTop: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Loading…</p>
    </div>
  </>
)

// ── Typography ─────────────────────────────────────────────────────────────────
export const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: G[900], fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.3px" }}>{title}</h1>
    {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: G[600], fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>}
  </div>
)

export const Heading = ({ label, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <div style={{ width: 3, height: 18, borderRadius: 2, background: `linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink: 0 }} />
    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[800], fontFamily: "'DM Sans',sans-serif" }}>
      {label}
      {count !== undefined && <span style={{ fontWeight: 400, color: G[500], marginLeft: 6 }}>({count})</span>}
    </h2>
  </div>
)

export const CardHeader = ({ label, count, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 0, gap: 12, flexWrap: "wrap" }}>
    <Heading label={label} count={count} />
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{children}</div>
  </div>
)

// ── Form Primitives ────────────────────────────────────────────────────────────
export const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={s.fieldLabel}>{label}</label>
    {children}
  </div>
)

export const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type} value={value || ""} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} style={s.input}
    onFocus={e => { e.target.style.borderColor = G[400]; e.target.style.boxShadow = `0 0 0 3px ${G[100]}` }}
    onBlur={e =>  { e.target.style.borderColor = G[200]; e.target.style.boxShadow = "none" }}
  />
)

export const Select = ({ value, onChange, children }) => (
  <select
    value={value || ""} onChange={e => onChange(e.target.value)} style={s.input}
    onFocus={e => { e.target.style.borderColor = G[400]; e.target.style.boxShadow = `0 0 0 3px ${G[100]}` }}
    onBlur={e =>  { e.target.style.borderColor = G[200]; e.target.style.boxShadow = "none" }}
  >
    {children}
  </select>
)

export const Textarea = ({ value, onChange, placeholder }) => (
  <textarea
    value={value || ""} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} rows={3} style={{ ...s.input, resize: "vertical" }}
    onFocus={e => { e.target.style.borderColor = G[400]; e.target.style.boxShadow = `0 0 0 3px ${G[100]}` }}
    onBlur={e =>  { e.target.style.borderColor = G[200]; e.target.style.boxShadow = "none" }}
  />
)

// ── Display Primitives ─────────────────────────────────────────────────────────
export const Badge = ({ children, color = "green" }) => {
  const c = { green: [G[100], G[700]], blue: ["#dbeafe","#1d4ed8"], orange: ["#fed7aa","#c2410c"], gray: ["#f3f4f6","#374151"], red: ["#fee2e2","#dc2626"] }[color] || [G[100], G[700]]
  return <span style={{ background: c[0], color: c[1], borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{children}</span>
}

export const Avatar = ({ name, color = "green" }) => {
  const c = { green: [G[100], G[700]], blue: ["#dbeafe","#1d4ed8"], orange: ["#fed7aa","#c2410c"] }[color] || [G[100], G[700]]
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: c[0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c[1], flexShrink: 0, fontFamily: "'DM Sans',sans-serif" }}>
      {name?.charAt(0).toUpperCase() || "?"}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, onSave, children }) => (
  <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={s.modal}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G[800], fontFamily: "'DM Sans',sans-serif" }}>{title}</h3>
        <button style={s.iconBtn} onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${G[100]}` }}>
        <button style={s.btn} onClick={onClose}>Cancel</button>
        <button style={s.btnPrimary} onClick={onSave}>Save</button>
      </div>
    </div>
  </div>
)

// ── Table Primitives ───────────────────────────────────────────────────────────
export const Th = ({ children }) => <th style={s.th}>{children}</th>

export const Td = ({ children, muted }) => (
  <td style={{ padding: "11px 14px", fontSize: 13, color: muted ? G[600] : G[900], fontFamily: "'DM Sans',sans-serif", borderBottom: `1px solid ${G[50]}`, verticalAlign: "middle" }}>
    {children}
  </td>
)

export const EmptyRow = ({ cols }) => (
  <tr><td colSpan={cols} style={{ padding: "40px 0", textAlign: "center", color: G[400], fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>No records found</td></tr>
)

export const TableWrap = ({ cols, children }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr style={{ borderBottom: `1.5px solid ${G[100]}` }}>{cols.map(c => <Th key={c}>{c}</Th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

// ── Search & Buttons ───────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = "Search…" }) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: G[400], pointerEvents: "none" }}>
      <Icon name="search" size={14} />
    </div>
    <input
      style={{ ...s.input, paddingLeft: 32, width: 200 }}
      placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      onFocus={e => { e.target.style.borderColor = G[400]; e.target.style.boxShadow = `0 0 0 3px ${G[100]}` }}
      onBlur={e =>  { e.target.style.borderColor = G[200]; e.target.style.boxShadow = "none" }}
    />
  </div>
)

export const BtnRow = ({ children }) => <div style={{ display: "flex", gap: 8 }}>{children}</div>

// ── Helpers ────────────────────────────────────────────────────────────────────
export const sectionLabel = sec =>
  typeof sec === "object" ? `${sec?.branch?.name}-${sec?.year?.year}-${sec?.name}` : sec || "—"