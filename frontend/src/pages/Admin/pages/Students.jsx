// src/pages/admin/pages/Students.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select,
  TableWrap, EmptyRow, Td, Badge, Avatar, Icon, s
} from "../components/Shared"

const Students = ({ data, reload, toast }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})
  const [search, setSearch] = useState("")

  // users who don't yet have a student profile
  const usersWithoutProfile = (data.users || []).filter(u =>
    u.role === 'student' && !(data.students || []).find(st => st.user === u.id)
  )

  const open = (item = null) => {
    setForm(item ? {
      ...item,
      section_id: item.section || ""
    } : { mode: "register" })
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    try {
      if (modal === "add") {
        if (form.mode === "register") {
          // Step 1: create user account
          if (!form.username?.trim() || !form.password?.trim()) {
            toast("Username and password are required"); return
          }
          const res = await api.post("/api/register/", {
            username: form.username,
            password: form.password,
            first_name: form.first_name || "",
            last_name: form.last_name || "",
            email: form.email || "",
            role: "student",
          })
          // Step 2: create student profile linked to new user
          await api.post("/api/students/", {
            user: res.data.id,
            roll_number: form.roll_number || "",
            phone_number: form.phone_number || "",
            section_id: form.section_id || null,
          })
          toast("Student account and profile created")
        } else {
          // Link existing user to a new student profile
          if (!form.user_id) { toast("Please select a user"); return }
          await api.post("/api/students/", {
            user: form.user_id,
            roll_number: form.roll_number || "",
            phone_number: form.phone_number || "",
            section_id: form.section_id || null,
          })
          toast("Student profile created")
        }
      } else {
        // Edit existing student profile
        await api.patch(`/api/students/${form.id}/`, {
          roll_number: form.roll_number || "",
          phone_number: form.phone_number || "",
          section_id: form.section_id || null,
        })
        toast("Student updated")
      }
      close(); reload()
    } catch (e) {
      console.log("Student error:", e?.response?.data)
      toast(e?.response?.data?.username?.[0] || e?.response?.data?.user?.[0] || "Error saving student")
    }
  }

  const items = (data.students || []).filter(st =>
    `${st.full_name} ${st.email} ${st.roll_number}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Students" sub="View and manage student accounts" />
      <div style={s.card}>
        <CardHeader label="All Students" count={items.length}>
          <SearchBar value={search} onChange={setSearch}  />
          <button style={s.btnPrimary} onClick={() => open()}>
            <Icon name="plus" size={14} />Add Student
          </button>
        </CardHeader>
        <TableWrap cols={["Name", "Roll No.", "Email", "Section", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={5} /> : items.map(st => (
            <tr key={st.id}>
              <Td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={st.full_name} color="blue" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{st.full_name}</div>
                    <div style={{ fontSize: 11, color: G[500] }}>@{st.username}</div>
                  </div>
                </div>
              </Td>
              <Td muted>{st.roll_number || "—"}</Td>
              <Td muted>{st.email}</Td>
              <Td><Badge color="blue">{st.section || "—"}</Badge></Td>
              <Td>
                <button style={s.btnSm} onClick={() => open(st)}>
                  <Icon name="edit" size={12} />Edit
                </button>
              </Td>
            </tr>
          ))}
        </TableWrap>
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "Add Student" : "Edit Student"}
          onClose={close}
          onSave={save}
        >
          {modal === "add" && (
            <Field label="How would you like to add?">
              <Select
                value={form.mode}
                onChange={v => setForm(f => ({ ...f, mode: v }))}
              >
                <option value="register">Create new account + profile</option>
                <option value="link">Link existing user account to profile</option>
              </Select>
            </Field>
          )}

          {modal === "add" && form.mode === "register" && (
            <>
              <div style={s.formRow}>
                <Field label="First Name">
                  <Input value={form.first_name || ""} onChange={v => setForm(f => ({ ...f, first_name: v }))}  />
                </Field>
                <Field label="Last Name">
                  <Input value={form.last_name || ""} onChange={v => setForm(f => ({ ...f, last_name: v }))}  />
                </Field>
              </div>
              <div style={s.formRow}>
                <Field label="Username">
                  <Input value={form.username || ""} onChange={v => setForm(f => ({ ...f, username: v }))}  />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email || ""} onChange={v => setForm(f => ({ ...f, email: v }))}  />
                </Field>
              </div>
              <Field label="Password">
                <Input type="password" value={form.password || ""} onChange={v => setForm(f => ({ ...f, password: v }))}  />
              </Field>
            </>
          )}

          {modal === "add" && form.mode === "link" && (
            <Field label="Select User Account">
              <Select
                value={form.user_id || ""}
                onChange={v => setForm(f => ({ ...f, user_id: v }))}
              >
                <option value="">-- Select User --</option>
                {usersWithoutProfile.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username} — {u.first_name} {u.last_name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {/* Profile fields shown for both add modes and edit */}
          <div style={s.formRow}>
            <Field label="Roll Number">
              <Input value={form.roll_number || ""} onChange={v => setForm(f => ({ ...f, roll_number: v }))}  />
            </Field>
            <Field label="Phone Number">
              <Input value={form.phone_number || ""} onChange={v => setForm(f => ({ ...f, phone_number: v }))}  />
            </Field>
          </div>
          <Field label="Section">
            <Select
              value={form.section_id || ""}
              onChange={v => setForm(f => ({ ...f, section_id: v }))}
            >
              <option value="">-- Select Section --</option>
              {(data.sections || []).map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.branch?.name}-{sec.year?.year}-{sec.name}
                </option>
              ))}
            </Select>
          </Field>
        </Modal>
      )}
    </>
  )
}

export default Students