// src/pages/admin/pages/Messages.jsx
import { useState } from "react"
import api from "../../../api"
import {
  PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select, Textarea,
  TableWrap, EmptyRow, Td, Badge, Icon, s
} from "../components/shared"

const Messages = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const save = async () => {
    if (!form.title?.trim() || !form.message?.trim()) { toast("Title and message are required"); return }
    try {
      await api.post("/api/messages/send/", {
        title: form.title, message: form.message,
        target_section: form.target_section || null,
      })
      toast("Message sent"); setModal(false); setForm({}); reload()
    } catch { toast("Error sending message") }
  }

  const del = async id => {
    if (!window.confirm("Delete this message?")) return
    try { await api.delete(`/api/messages/${id}/`); toast("Message deleted"); reload() }
    catch { toast("Error deleting") }
  }

  const items = (data.messages || []).filter(m =>
    `${m.title} ${m.sent_by_name} ${m.section_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Messages" sub="Send announcements to students and teachers" />
      <div style={s.card}>
        <CardHeader label="All Messages" count={items.length}>
          <SearchBar value={search} onChange={setSearch} />
          <button style={s.btnPrimary} onClick={() => { setForm({}); setModal(true) }}><Icon name="plus" size={14} />Send Message</button>
        </CardHeader>
        <TableWrap cols={["Title", "Preview", "Sent By", "Target", "Date", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={6} /> : items.map(m => (
            <tr key={m.id}>
              <Td><b>{m.title}</b></Td>
              <Td muted>
                <span style={{ display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.message}
                </span>
              </Td>
              <Td muted>{m.sent_by_name}</Td>
              <Td><Badge>{m.section_name || "All"}</Badge></Td>
              <Td muted>{m.created_at?.slice(0, 10)}</Td>
              <Td><button style={s.btnDanger} onClick={() => del(m.id)}><Icon name="trash" size={12} />Delete</button></Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal && (
        <Modal title="Send Message" onClose={() => setModal(false)} onSave={save}>
          <Field label="Title">
            <Input value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Exam Schedule Update" />
          </Field>
          <Field label="Message">
            <Textarea value={form.message} onChange={v => setForm(f => ({ ...f, message: v }))} placeholder="Write your message here…" />
          </Field>
          <Field label="Target Section (leave blank to send to everyone)">
            <Select value={form.target_section} onChange={v => setForm(f => ({ ...f, target_section: v }))}>
              <option value="">All Students and Teachers</option>
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

export default Messages