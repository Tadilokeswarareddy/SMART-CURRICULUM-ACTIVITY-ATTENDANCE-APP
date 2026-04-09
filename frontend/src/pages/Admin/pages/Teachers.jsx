// src/pages/admin/pages/Teachers.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input,
  TableWrap, EmptyRow, Td, Badge, Avatar, Icon, s
} from "../components/shared"

const Teachers = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [search, setSearch] = useState("")

  const open  = (item = null) => { setForm(item || {}); setModal(item ? "edit" : "add") }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.username?.trim() || !form.email?.trim()) { toast("Username and email are required"); return }
    if (modal === "add") {
      if (!form.password?.trim()) { toast("Password is required"); return }
      try {
        await api.post("/api/register/", {
          username: form.username, password: form.password,
          first_name: form.first_name || "", last_name: form.last_name || "",
          email: form.email, role: "teacher",
        })
        toast("Teacher account created"); close(); reload()
      } catch (e) { toast(e?.response?.data?.username?.[0] || "Error creating teacher") }
    } else {
      toast("Profile details are managed by the teacher from their own login"); close()
    }
  }

  const items = (data.teachers || []).filter(t =>
    `${t.full_name} ${t.email} ${t.designation} ${t.department}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Teachers" sub="View and manage teacher accounts" />
      <div style={s.card}>
        <CardHeader label="All Teachers" count={items.length}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or dept…" />
          <button style={s.btnPrimary} onClick={() => open()}><Icon name="plus" size={14} />Add Teacher</button>
        </CardHeader>
        <TableWrap cols={["Name", "Email", "Designation", "Department", "Emp ID"]}>
          {items.length === 0 ? <EmptyRow cols={5} /> : items.map(t => (
            <tr key={t.id}>
              <Td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={t.full_name} color="green" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.full_name}</div>
                    <div style={{ fontSize: 11, color: G[500] }}>@{t.username}</div>
                  </div>
                </div>
              </Td>
              <Td muted>{t.email}</Td>
              <Td><Badge>{t.designation || "—"}</Badge></Td>
              <Td muted>{t.department || "—"}</Td>
              <Td muted>{t.employee_id || "—"}</Td>
            </tr>
          ))}
        </TableWrap>
      </div>
      {modal === "add" && (
        <Modal title="Add Teacher Account" onClose={close} onSave={save}>
          <div style={s.formRow}>
            <Field label="First Name"><Input value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} placeholder="Jane" /></Field>
            <Field label="Last Name"><Input value={form.last_name} onChange={v => setForm(f => ({ ...f, last_name: v }))} placeholder="Doe" /></Field>
          </div>
          <div style={s.formRow}>
            <Field label="Username"><Input value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="jdoe" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="jane@uni.edu" /></Field>
          </div>
          <Field label="Password">
            <Input type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Set a password" />
          </Field>
          <p style={{ fontSize: 12, color: G[600], margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
            The teacher can fill in their designation, department, and bio from their own profile page after logging in.
          </p>
        </Modal>
      )}
    </>
  )
}

export default Teachers