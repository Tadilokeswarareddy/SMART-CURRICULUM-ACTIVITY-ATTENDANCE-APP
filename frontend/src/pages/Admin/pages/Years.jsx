// src/pages/admin/pages/Years.jsx
import { useState } from "react"
import api from "../../../api"
import {
  PageTitle, CardHeader, Modal, Field, Select,
  TableWrap, EmptyRow, Td, Icon, s
} from "../components/Shared"

const Years = ({ data, reload, toast }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})

  const open  = (item = null) => { setForm(item || {}); setModal(item ? "edit" : "add") }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.year) { toast("Please select a year"); return }
    try {
      modal === "edit"
        ? await api.patch(`/api/years/${form.id}/`, { year: form.year })
        : await api.post("/api/years/", { year: form.year })
      toast(modal === "edit" ? "Year updated" : "Year created"); close(); reload()
    } catch { toast("Error saving year") }
  }

  return (
    <>
      <PageTitle title="Years" sub="Academic year levels (1st to 4th year)" />
      <div style={s.card}>
        <CardHeader label="All Years" count={data.years?.length || 0}>
          <button style={s.btnPrimary} onClick={() => open()}><Icon name="plus" size={14} />Add Year</button>
        </CardHeader>
        <TableWrap cols={["ID", "Year", "Actions"]}>
          {(data.years || []).length === 0 ? <EmptyRow cols={3} /> : (data.years || []).map(y => (
            <tr key={y.id}>
              <Td muted>{y.id}</Td>
              <Td><b>Year {y.year}</b></Td>
              <Td><button style={s.btnSm} onClick={() => open(y)}><Icon name="edit" size={12} />Edit</button></Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal && (
        <Modal title={modal === "edit" ? "Edit Year" : "Add Year"} onClose={close} onSave={save}>
          <Field label="Year Number">
            <Select value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))}>
              <option value="">-- Select Year --</option>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>Year {n}</option>)}
            </Select>
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Years