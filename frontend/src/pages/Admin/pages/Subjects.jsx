// src/pages/admin/pages/Subjects.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select, Textarea,
  TableWrap, EmptyRow, Td, BtnRow, Badge, Icon, s
} from "../components/shared"

const Subjects = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const open = (item = null) => {
    setForm(item ? {
      ...item,
      branch_id: item.branch?.id,
      year_id: item.year?.id
    } : {})
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.name?.trim() || !form.code?.trim()) {
      toast("Name and code are required"); return
    }
    if (!form.branch_id || !form.year_id) {
      toast("Branch and year are required"); return
    }
    try {
      const payload = {
        name: form.name,
        code: form.code,
        branch_id: form.branch_id,
        year_id: form.year_id,
        syllabus_description: form.syllabus_description || ""
      }
      modal === "edit"
        ? await api.patch(`/api/subjects/${form.id}/`, payload)
        : await api.post("/api/subjects/", payload)
      toast(modal === "edit" ? "Subject updated" : "Subject created")
      close(); reload()
    } catch (e) {
      console.log("Subject error:", e?.response?.data)
      toast(e?.response?.data?.code?.[0] || "Error saving subject")
    }
  }

  const del = async id => {
    if (!window.confirm("Delete this subject?")) return
    try { await api.delete(`/api/subjects/${id}/`); toast("Subject deleted"); reload() }
    catch { toast("Error deleting") }
  }

  const items = (data.subjects || []).filter(sub =>
    `${sub.name} ${sub.code} ${sub.branch?.name}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Subjects" sub="Manage subjects and their syllabus" />
      <div style={s.card}>
        <CardHeader label="All Subjects" count={items.length}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or code…" />
          <button style={s.btnPrimary} onClick={() => open()}>
            <Icon name="plus" size={14} />Add Subject
          </button>
        </CardHeader>
        <TableWrap cols={["Name", "Code", "Branch", "Year", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={5} /> : items.map(sub => (
            <tr key={sub.id}>
              <Td><b>{sub.name}</b></Td>
              <Td>
                <code style={{
                  background: G[50], padding: "2px 8px", borderRadius: 5,
                  fontSize: 12, color: G[800], border: `1px solid ${G[200]}`
                }}>
                  {sub.code}
                </code>
              </Td>
              <Td muted>{sub.branch?.name || "—"}</Td>
              <Td><Badge color="orange">Year {sub.year?.year || "—"}</Badge></Td>
              <Td>
                <BtnRow>
                  <button style={s.btnSm} onClick={() => open(sub)}>
                    <Icon name="edit" size={12} />Edit
                  </button>
                  <button style={s.btnDanger} onClick={() => del(sub.id)}>
                    <Icon name="trash" size={12} />Delete
                  </button>
                </BtnRow>
              </Td>
            </tr>
          ))}
        </TableWrap>
      </div>

      {modal && (
        <Modal
          title={modal === "edit" ? "Edit Subject" : "Add Subject"}
          onClose={close}
          onSave={save}
        >
          <div style={s.formRow}>
            <Field label="Subject Name">
              <Input
                value={form.name || ""}
                onChange={v => setForm(f => ({ ...f, name: v }))}
                
              />
            </Field>
            <Field label="Subject Code">
              <Input
                value={form.code || ""}
                onChange={v => setForm(f => ({ ...f, code: v }))}
                
              />
            </Field>
          </div>
          <div style={s.formRow}>
            <Field label="Branch">
              <Select
                value={form.branch_id || ""}
                onChange={v => setForm(f => ({ ...f, branch_id: v }))}
              >
                <option value="">-- Select Branch --</option>
                {(data.branches || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Year">
              <Select
                value={form.year_id || ""}
                onChange={v => setForm(f => ({ ...f, year_id: v }))}
              >
                <option value="">-- Select Year --</option>
                {(data.years || []).map(y => (
                  <option key={y.id} value={y.id}>Year {y.year}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Syllabus Description (optional)">
            <Textarea
              value={form.syllabus_description || ""}
              onChange={v => setForm(f => ({ ...f, syllabus_description: v }))}
              
            />
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Subjects