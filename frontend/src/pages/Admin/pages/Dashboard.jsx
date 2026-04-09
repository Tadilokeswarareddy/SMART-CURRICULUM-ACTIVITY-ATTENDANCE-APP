// src/pages/admin/pages/Dashboard.jsx
import { G, PageTitle, Heading, TableWrap, EmptyRow, Td, Badge, s } from "../components/shared"

const Dashboard = ({ data }) => {
  const stats = [
    { label: "Teachers",    val: data.teachers?.length    ?? 0 },
    { label: "Students",    val: data.students?.length    ?? 0 },
    { label: "Branches",    val: data.branches?.length    ?? 0 },
    { label: "Sections",    val: data.sections?.length    ?? 0 },
    { label: "Subjects",    val: data.subjects?.length    ?? 0 },
    { label: "Assignments", val: data.assignments?.length ?? 0 },
    { label: "Timetable",   val: data.timetable?.length   ?? 0 },
    { label: "Messages",    val: data.messages?.length    ?? 0 },
  ]

  const sectionLabel = sec =>
    typeof sec === "object" ? `${sec?.branch?.name}-${sec?.year?.year}-${sec?.name}` : sec || "—"

  return (
    <>
      <PageTitle title="Dashboard" sub="Overview of your institution" />
      <div style={s.statsGrid}>
        {stats.map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ fontSize: 30, fontWeight: 700, color: G[800], lineHeight: 1, fontFamily: "'DM Serif Display',serif" }}>{st.val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: G[500], textTransform: "uppercase", letterSpacing: "1.2px", marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>{st.label}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <Heading label="Recent Messages" />
        <TableWrap cols={["Title", "From", "Target", "Date"]}>
          {(data.messages || []).length === 0 ? <EmptyRow cols={4} /> :
            (data.messages || []).slice(0, 6).map(m => (
              <tr key={m.id}>
                <Td><b>{m.title}</b></Td>
                <Td muted>{m.sent_by_name}</Td>
                <Td><Badge>{m.section_name || "All"}</Badge></Td>
                <Td muted>{m.created_at?.slice(0, 10)}</Td>
              </tr>
            ))
          }
        </TableWrap>
      </div>
      <div style={s.card}>
        <Heading label="Teaching Assignments" />
        <TableWrap cols={["Teacher", "Subject", "Section"]}>
          {(data.assignments || []).length === 0 ? <EmptyRow cols={3} /> :
            (data.assignments || []).map(a => (
              <tr key={a.id}>
                <Td><b>{a.teacher}</b></Td>
                <Td>{a.subject?.name || a.subject}</Td>
                <Td><Badge color="blue">{sectionLabel(a.section)}</Badge></Td>
              </tr>
            ))
          }
        </TableWrap>
      </div>
    </>
  )
}

export default Dashboard