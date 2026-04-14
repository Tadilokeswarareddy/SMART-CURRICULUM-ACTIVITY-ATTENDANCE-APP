// src/pages/admin/pages/Teachers.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input, Select,
  TableWrap, EmptyRow, Td, Badge, Avatar, Icon, s
} from "../components/shared"

const DESIGNATIONS = [
  { value: "professor", label: "Professor" },
  { value: "associate_professor", label: "Associate Professor" },
  { value: "assistant_professor", label: "Assistant Professor" },
  { value: "lecturer", label: "Lecturer" },
]

const Teachers = ({ data, reload, toast }) => {
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})
  const [search, setSearch] = useState("")

  const usersWithoutProfile = (data.users || []).filter(u =>
    u.role === 'teacher' && !(data.teachers || []).find(t => t.user_id === u.id)
  )

  const open = (item = null) => {
    setForm(item ? { ...item, mode: "edit" } : { mode: "register" })
    setModal(item ? "edit" : "add")
  }
  const close = () => setModal(null)

  const save = async () => {
    try {
      if (modal === "add") {
        if (form.mode === "register") {
          if (!form.username?.trim() || !form.password?.trim()) {
            toast("Username and password are required"); return
          }
          // Step 1: create user
          const res = await api.post("/api/register/", {
            username: form.username,
            password: form.password,
            first_name: form.first_name || "",
            last_name: form.last_name || "",
            email: form.email || "",
            role: "teacher",
          })
          // Step 2: create teacher profile
          await api.post("/api/teacher/", {
            user_id: res.data.id,
            phone_number: form.phone_number || "",
            employee_id: form.employee_id || "",
            designation: form.designation || "",
            department: form.department || "",
          })
          toast("Teacher account and profile created")
        } else {
          if (!form.user_id) { toast("Please select a user"); return }
          await api.post("/api/teacher/", {
            user_id: form.user_id,
            phone_number: form.phone_number || "",
            employee_id: form.employee_id || "",
            designation: form.designation || "",
            department: form.department || "",
          })
          toast("Teacher profile created")
        }
      } else {
        await api.patch(`/api/teacher/${form.id}/`, {
          phone_number: form.phone_number || "",
          employee_id: form.employee_id || "",
          designation: form.designation || "",
          department: form.department || "",
          qualification: form.qualification || "",
          experience_years: form.experience_years || 0,
          bio: form.bio || "",
        })
        toast("Teacher updated")
      }
      close(); reload()
    } catch (e) {
      console.log("Teacher error:", e?.response?.data)
      toast(e?.response?.data?.username?.[0] || e?.response?.data?.user?.[0] || "Error saving teacher")
    }
  }

  const items = (data.teachers || []).filter(t =>
    `${t.full_name} ${t.email} ${t.designation} ${t.department}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <PageTitle title="Teachers" sub="View and manage teacher accounts" />
      <div style={s.card}>
        <CardHeader label="All Teachers" count={items.length}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or dept…" />
          <button style={s.btnPrimary} onClick={() => open()}>
            <Icon name="plus" size={14} />Add Teacher
          </button>
        </CardHeader>
        <TableWrap cols={["Name", "Email", "Designation", "Department", "Emp ID", "Actions"]}>
          {items.length === 0 ? <EmptyRow cols={6} /> : items.map(t => (
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
              <Td>
                <button style={s.btnSm} onClick={() => open(t)}>
                  <Icon name="edit" size={12} />Edit
                </button>
              </Td>
            </tr>
          ))}
        </TableWrap>
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "Add Teacher" : "Edit Teacher"}
          onClose={close}
          onSave={save}
        >
          {modal === "add" && (
            <Field label="How would you like to add?">
              <Select value={form.mode} onChange={v => setForm(f => ({ ...f, mode: v }))}>
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
              <Select value={form.user_id || ""} onChange={v => setForm(f => ({ ...f, user_id: v }))}>
                <option value="">-- Select User --</option>
                {usersWithoutProfile.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username} — {u.first_name} {u.last_name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {/* Profile fields for all modes */}
          <div style={s.formRow}>
            <Field label="Employee ID">
              <Input value={form.employee_id || ""} onChange={v => setForm(f => ({ ...f, employee_id: v }))}  />
            </Field>
            <Field label="Phone Number">
              <Input value={form.phone_number || ""} onChange={v => setForm(f => ({ ...f, phone_number: v }))}  />
            </Field>
          </div>
          <div style={s.formRow}>
            <Field label="Designation">
              <Select value={form.designation || ""} onChange={v => setForm(f => ({ ...f, designation: v }))}>
                <option value="">-- Select --</option>
                {DESIGNATIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Department">
              <Input value={form.department || ""} onChange={v => setForm(f => ({ ...f, department: v }))}  />
            </Field>
          </div>
          {modal === "edit" && (
            <>
              <div style={s.formRow}>
                <Field label="Qualification">
                  <Input value={form.qualification || ""} onChange={v => setForm(f => ({ ...f, qualification: v }))} />
                </Field>
                <Field label="Experience (years)">
                  <Input type="number" value={form.experience_years || ""} onChange={v => setForm(f => ({ ...f, experience_years: v }))}  />
                </Field>
              </div>
              <Field label="Bio">
                <Input value={form.bio || ""} onChange={v => setForm(f => ({ ...f, bio: v }))}  />
              </Field>
            </>
          )}
        </Modal>
      )}
    </>
  )
}

export default Teachers