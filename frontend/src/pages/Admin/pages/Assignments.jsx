// src/pages/admin/pages/Assignments.jsx
import { useState } from "react"
import api from "../../../api"
import {
  PageTitle, CardHeader, SearchBar, Modal, Field, Select,
  TableWrap, EmptyRow, Td, BtnRow, Badge, Icon, sectionLabel, s
} from "../components/shared"

const Assignments = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const open = (item = null) => {
    setForm(item ? { ...item, teacher_id: item.teacher_id, subject_id: item.subject?.id, section_id: item.section?.id } : {})
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.teacher_id || !form.subject_id || !form.section_id) { toast("All fields are required"); return }
    try {
      const payload = { teacher: form.teacher_id, subject: form.subject_id, section: form.section_id }
      modal === "edit"
        ? await api.patch(`/api/assignments/${form.id}/`, payload)
        : await api.post("/api/assignments/", payload)
      toast(modal === "edit" ? "Assignment updated" : "Assignment created"); close(); reload()
    } catch (e) { toast(e?.response?.data?.non_field_errors?.[0] || "Error — this assignment may already exist") }
  }

  const del = async id => {
    if (!window.confirm("Delete this assignment?")) return
    try { await api.delete(`/api/assignments/${id}/`); toast("Assignment deleted"); reload() }
    catch { toast("Error deleting") }
  }

  const items = (data.assignments || []).filter(a =>
    `${a.teacher} ${a.subject?.name} ${a.section}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Teaching Assignments" sub="Link teachers to subjects and sections" />
      <div style={s.card}>
        <CardHeader label="All Assignments" count={items.length}>
          <SearchBar value={search} onChange={setSearch} />
          <button style={s.btnPrimary} onClick={() => open()}><Icon name="plus" size={14} />New Assignment</button>
        </CardHeader>
        <TableWrap cols={["Teacher", "Subject", "Section", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={4} /> : items.map(a => (
            <tr key={a.id}>
              <Td><b>{a.teacher}</b></Td>
              <Td>{a.subject?.name || a.subject}</Td>
              <Td><Badge color="blue">{sectionLabel(a.section)}</Badge></Td>
              <Td><BtnRow>
                <button style={s.btnSm} onClick={() => open(a)}><Icon name="edit" size={12} />Edit</button>
                <button style={s.btnDanger} onClick={() => del(a.id)}><Icon name="trash" size={12} />Delete</button>
              </BtnRow></Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal && (
        <Modal title={modal === "edit" ? "Edit Assignment" : "New Assignment"} onClose={close} onSave={save}>
          <Field label="Teacher">
            <Select value={form.teacher_id} onChange={v => setForm(f => ({ ...f, teacher_id: v }))}>
              <option value="">-- Select Teacher --</option>
              {(data.teachers || []).map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Subject">
            <Select value={form.subject_id} onChange={v => setForm(f => ({ ...f, subject_id: v }))}>
              <option value="">-- Select Subject --</option>
              {(data.subjects || []).map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
            </Select>
          </Field>
          <Field label="Section">
            <Select value={form.section_id} onChange={v => setForm(f => ({ ...f, section_id: v }))}>
              <option value="">-- Select Section --</option>
              {(data.sections || []).map(sec => (
                <option key={sec.id} value={sec.id}>{sec.branch?.name}-{sec.year?.year}-{sec.name}</option>
              ))}
            </Select>
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Assignments