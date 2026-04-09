// src/pages/admin/pages/Branches.jsx
import { useState } from "react"
import api from "../../../api"
import {
  PageTitle, CardHeader, SearchBar, Modal, Field, Input,
  TableWrap, EmptyRow, Td, BtnRow, Icon, s
} from "../components/shared"

const Branches = ({ data, reload, toast }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})
  const [search, setSearch] = useState("")

  const open  = (item = null) => { setForm(item || {}); setModal(item ? "edit" : "add") }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.name?.trim()) { toast("Branch name is required"); return }
    try {
      modal === "edit"
        ? await api.patch(`/api/branches/${form.id}/`, { name: form.name })
        : await api.post("/api/branches/", { name: form.name })
      toast(modal === "edit" ? "Branch updated" : "Branch created"); close(); reload()
    } catch { toast("Error saving branch") }
  }

  const del = async id => {
    if (!window.confirm("Delete this branch?")) return
    try { await api.delete(`/api/branches/${id}/`); toast("Branch deleted"); reload() }
    catch { toast("Error — branch may have linked sections") }
  }

  const items = (data.branches || []).filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Branches" sub="Manage academic branches and departments" />
      <div style={s.card}>
        <CardHeader label="All Branches" count={items.length}>
          <SearchBar value={search} onChange={setSearch} />
          <button style={s.btnPrimary} onClick={() => open()}><Icon name="plus" size={14} />Add Branch</button>
        </CardHeader>
        <TableWrap cols={["ID", "Name", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(b => (
            <tr key={b.id}>
              <Td muted>{b.id}</Td>
              <Td><b>{b.name}</b></Td>
              <Td><BtnRow>
                <button style={s.btnSm} onClick={() => open(b)}><Icon name="edit" size={12} />Edit</button>
                <button style={s.btnDanger} onClick={() => del(b.id)}><Icon name="trash" size={12} />Delete</button>
              </BtnRow></Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal && (
        <Modal title={modal === "edit" ? "Edit Branch" : "Add Branch"} onClose={close} onSave={save}>
          <Field label="Branch Name">
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Computer Science" />
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Branches