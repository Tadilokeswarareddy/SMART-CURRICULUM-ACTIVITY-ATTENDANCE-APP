// src/pages/admin/pages/Timetable.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select,
  TableWrap, EmptyRow, Td, BtnRow, Badge, Icon, sectionLabel, s
} from "../components/shared"

const DAYS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
]
const dayLabel = val => DAYS.find(d => d.value === val)?.label || val

const Timetable = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const open = (item = null) => {
    setForm(item ? { ...item, assignment_id: item.assignment?.id } : {})
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.assignment_id || !form.day || !form.start_time || !form.end_time) {
      toast("All fields are required"); return
    }
    try {
      const payload = { assignment: form.assignment_id, day: form.day, start_time: form.start_time, end_time: form.end_time }
      modal === "edit"
        ? await api.patch(`/api/timetable/${form.id}/`, payload)
        : await api.post("/api/timetable/", payload)
      toast(modal === "edit" ? "Entry updated" : "Entry added"); close(); reload()
    } catch (e) { toast(e?.response?.data?.non_field_errors?.[0] || "Error saving entry") }
  }

  const del = async id => {
    if (!window.confirm("Delete this timetable entry?")) return
    try { await api.delete(`/api/timetable/${id}/`); toast("Entry deleted"); reload() }
    catch { toast("Error deleting") }
  }

  const items = (data.timetable || []).filter(t =>
    `${t.assignment?.subject?.name} ${t.assignment?.teacher} ${t.day}`.toLowerCase().includes(search.toLowerCase())
  )

  const selectedAssignment = form.assignment_id
    ? (data.assignments || []).find(a => a.id == form.assignment_id)
    : null

  return (
    <>
      <PageTitle title="Timetable" sub="Manage class schedules for all sections" />
      <div style={s.card}>
        <CardHeader label="All Entries" count={items.length}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search subject, teacher…" />
          <button style={s.btnPrimary} onClick={() => open()}><Icon name="plus" size={14} />Add Entry</button>
        </CardHeader>
        <TableWrap cols={["Day", "Subject", "Teacher", "Section", "Start", "End", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={7} /> : items.map(t => (
            <tr key={t.id}>
              <Td><Badge color="gray">{dayLabel(t.day)}</Badge></Td>
              <Td><b>{t.assignment?.subject?.name || "—"}</b></Td>
              <Td muted>{t.assignment?.teacher || "—"}</Td>
              <Td><Badge color="blue">{sectionLabel(t.assignment?.section)}</Badge></Td>
              <Td muted>{t.start_time}</Td>
              <Td muted>{t.end_time}</Td>
              <Td><BtnRow>
                <button style={s.btnSm} onClick={() => open(t)}><Icon name="edit" size={12} />Edit</button>
                <button style={s.btnDanger} onClick={() => del(t.id)}><Icon name="trash" size={12} />Delete</button>
              </BtnRow></Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal && (
        <Modal title={modal === "edit" ? "Edit Timetable Entry" : "Add Timetable Entry"} onClose={close} onSave={save}>
          <Field label="Teaching Assignment">
            <Select value={form.assignment_id} onChange={v => setForm(f => ({ ...f, assignment_id: v }))}>
              <option value="">-- Select Assignment --</option>
              {(data.assignments || []).map(a => (
                <option key={a.id} value={a.id}>
                  {a.teacher} — {a.subject?.name || a.subject} — {sectionLabel(a.section)}
                </option>
              ))}
            </Select>
          </Field>
          {selectedAssignment && (
            <div style={{ background: G[50], border: `1px solid ${G[200]}`, borderRadius: 8, padding: "9px 13px", fontSize: 12, color: G[700], fontFamily: "'DM Sans',sans-serif" }}>
              {selectedAssignment.teacher} teaches {selectedAssignment.subject?.name || selectedAssignment.subject}
            </div>
          )}
          <Field label="Day">
            <Select value={form.day} onChange={v => setForm(f => ({ ...f, day: v }))}>
              <option value="">-- Select Day --</option>
              {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Select>
          </Field>
          <div style={s.formRow}>
            <Field label="Start Time">
              <Input type="time" value={form.start_time} onChange={v => setForm(f => ({ ...f, start_time: v }))} />
            </Field>
            <Field label="End Time">
              <Input type="time" value={form.end_time} onChange={v => setForm(f => ({ ...f, end_time: v }))} />
            </Field>
          </div>
        </Modal>
      )}
    </>
  )
}

export default Timetable