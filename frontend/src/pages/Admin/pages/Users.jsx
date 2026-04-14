// src/pages/admin/pages/Users.jsx
import { useState } from "react"
import api from "../../../api"
import {
  G, PageTitle, CardHeader, SearchBar, Modal, Field, Input,
  TableWrap, EmptyRow, Td, Badge, Avatar, Icon, s
} from "../components/shared"

const roleColor = role => ({ teacher: "green", student: "blue", admin: "orange" }[role] || "gray")

const Users = ({ data, reload, toast }) => {
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ role: "student" })
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const close = () => { setModal(false); setForm({ role: "student" }) }

  const save = async () => {
    if (!form.username?.trim()) { toast("Username is required"); return }
    if (!form.email?.trim())    { toast("Email is required"); return }
    if (!form.password?.trim()) { toast("Password is required"); return }
    if (!form.role)             { toast("Role is required"); return }

    try {
      await api.post("/api/register/", {
        username:   form.username,
        password:   form.password,
        first_name: form.first_name || "",
        last_name:  form.last_name  || "",
        email:      form.email,
        role:       form.role,
      })
      toast(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created`)
      close()
      reload()
    } catch (e) {
      const msg = e?.response?.data?.username?.[0]
        || e?.response?.data?.email?.[0]
        || "Error creating user"
      toast(msg)
    }
  }
  const allUsers = (data.users || [])

  const items = allUsers.filter(u => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim()
    const matchSearch = `${fullName} ${u.username} ${u.email}`
      .toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  const hasStudentProfile = userId =>
    (data.students || []).some(st => st.user === userId)
  const hasTeacherProfile = userId =>
    (data.teachers || []).some(t => t.user_id === userId)

  return (
    <>
      <PageTitle title="Users" sub="View all accounts and create new ones" />
      <div style={s.card}>
        <CardHeader label="All Users" count={items.length}>
          <div style={{ display: "flex", gap: 4, background: G[50], borderRadius: 9, padding: 3, border: `1px solid ${G[100]}` }}>
            {["all", "teacher", "student", "admin"].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700,
                  background: roleFilter === r ? G[700] : "transparent",
                  color: roleFilter === r ? "#fff" : G[600],
                  transition: "all 0.12s", textTransform: "capitalize",
                }}
              >
                {r === "all" ? "All" : r + "s"}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email…" />
          <button style={s.btnPrimary} onClick={() => { setForm({ role: "student" }); setModal(true) }}>
            <Icon name="plus" size={14} />Add User
          </button>
        </CardHeader>

        <TableWrap cols={["Name", "Username", "Email", "Role", "Profile"]}>
          {items.length === 0 ? <EmptyRow cols={5} /> : items.map(u => {
            const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username
            const hasProfile =
              u.role === "student" ? hasStudentProfile(u.id) :
              u.role === "teacher" ? hasTeacherProfile(u.id) : true
            return (
              <tr key={u.id}>
                <Td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={fullName} color={roleColor(u.role)} />
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{fullName}</div>
                  </div>
                </Td>
                <Td muted>@{u.username}</Td>
                <Td muted>{u.email || "—"}</Td>
                <Td><Badge color={roleColor(u.role)}>{u.role}</Badge></Td>
                <Td>
                  {hasProfile
                    ? <Badge color="green">Profile set</Badge>
                    : <Badge color="orange">No profile</Badge>
                  }
                </Td>
              </tr>
            )
          })}
        </TableWrap>
      </div>

      {modal && (
        <Modal title="Add New User" onClose={close} onSave={save}>
          <Field label="Role">
            <div style={{ display: "flex", gap: 8 }}>
              {["student", "teacher", "admin"].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 9, border: "1.5px solid",
                    borderColor: form.role === r ? G[600] : G[200],
                    background: form.role === r ? G[100] : "#fff",
                    color: form.role === r ? G[800] : G[500],
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.12s", textTransform: "capitalize",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

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

          {form.role === "teacher" && (
            <p style={{ margin: 0, fontSize: 12, color: G[600], fontFamily: "'DM Sans',sans-serif", background: G[50], padding: "8px 12px", borderRadius: 8, border: `1px solid ${G[100]}` }}>
              After creating the account, go to Teachers page to set up their profile.
            </p>
          )}
          {form.role === "student" && (
            <p style={{ margin: 0, fontSize: 12, color: G[600], fontFamily: "'DM Sans',sans-serif", background: G[50], padding: "8px 12px", borderRadius: 8, border: `1px solid ${G[100]}` }}>
              After creating the account, go to Students page to set up their profile.
            </p>
          )}
          {form.role === "admin" && (
            <p style={{ margin: 0, fontSize: 12, color: "#c2410c", fontFamily: "'DM Sans',sans-serif", background: "#fff7ed", padding: "8px 12px", borderRadius: 8, border: "1px solid #fed7aa" }}>
              Admin accounts have full access to this panel. Use with caution.
            </p>
          )}
        </Modal>
      )}
    </>
  )
}

export default Users