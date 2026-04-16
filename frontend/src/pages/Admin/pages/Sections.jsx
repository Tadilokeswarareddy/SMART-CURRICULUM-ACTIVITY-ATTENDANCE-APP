// src/pages/admin/pages/Sections.jsx
import { useState } from "react"
import api from "../../../api"
import {
  PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select,
  TableWrap, EmptyRow, Td, BtnRow, Badge, Icon, s
} from "../components/Shared"

const Sections = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const open = (item = null) => {
    setForm(item ? { ...item, branch_id: item.branch?.id, year_id: item.year?.id } : {})
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.branch_id || !form.year_id || !form.name?.trim()) {
      toast("All fields are required"); return
    }
    try {
      const payload = {
        branch_id: form.branch_id,   // ← was 'branch'
        year_id: form.year_id,       // ← was 'year'
        name: form.name
      }
      modal === "edit"
        ? await api.patch(`/api/sections/${form.id}/`, payload)
        : await api.post("/api/sections/", payload)
      toast(modal === "edit" ? "Section updated" : "Section created")
      close(); reload()
    } catch (e) {
      console.log("Section error:", e?.response?.data)
      toast("Error saving section")
    }
  }

  const del = async id => {
    if (!window.confirm("Delete this section?")) return
    try { await api.delete(`/api/sections/${id}/`); toast("Section deleted"); reload() }
    catch { toast("Error — section may have linked students") }
  }

  const items = (data.sections || []).filter(sec =>
    `${sec.branch?.name} ${sec.name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Sections" sub="Manage class sections within branches" />
      <div style={s.card}>
        <CardHeader label="All Sections" count={items.length}>
          <SearchBar value={search} onChange={setSearch} />
          <button style={s.btnPrimary} onClick={() => open()}>
            <Icon name="plus" size={14} />Add Section
          </button>
        </CardHeader>
        <TableWrap cols={["Section", "Branch", "Year", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={4} /> : items.map(sec => (
            <tr key={sec.id}>
              <Td><b>{sec.branch?.name}-{sec.year?.year}-{sec.name}</b></Td>
              <Td muted>{sec.branch?.name}</Td>
              <Td><Badge color="orange">Year {sec.year?.year}</Badge></Td>
              <Td>
                <BtnRow>
                  <button style={s.btnSm} onClick={() => open(sec)}>
                    <Icon name="edit" size={12} />Edit
                  </button>
                  <button style={s.btnDanger} onClick={() => del(sec.id)}>
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
          title={modal === "edit" ? "Edit Section" : "Add Section"}
          onClose={close}
          onSave={save}
        >
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
          <Field label="Section Name (A, B, C…)">
            <Input
              value={form.name || ""}
              onChange={v => setForm(f => ({ ...f, name: v }))}
            />
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Sections