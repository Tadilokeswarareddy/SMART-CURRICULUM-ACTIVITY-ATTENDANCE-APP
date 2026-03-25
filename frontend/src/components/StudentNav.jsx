import React, { useState } from "react"
import { Link } from "react-router-dom"

const StudentNav = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full bg-[#e6f6ee] ">
      <div className="flex items-center justify-between px-5 md:px-10 h-16">
        
        {/* LOGO */}
        <Link to="/studenthome">
          <h1 className="text-2xl font-bold text-green-700">
            Shusseki
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-12 bg-white shadow-md border rounded-3xl px-10 h-12">
          <NavLink to="/studenthome" label="HOME" />
          <NavLink to="/studenttimetable" label="TIME TABLE" />
          <NavLink to="/scanqr" label="SCAN QR" />
          <NavLink to="/curriculum" label="CURRICULUM" />
          <NavLink to="/studentprofile" label="PROFILE" />
        </nav>

        {/* DESKTOP LOGOUT */}
        <Link
          to="/logout"
          className="hidden md:block px-4 py-2 bg-red-600 text-white rounded-md text-sm"
        >
          Logout
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-green-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white shadow-md border-t">
          <MobileLink to="/studenthome" label="HOME" setOpen={setOpen} />
          <MobileLink to="/studenttimetable" label="TIME TABLE" setOpen={setOpen} />
          <MobileLink to="/scanqr" label="SCAN QR" setOpen={setOpen} />
          <MobileLink to="/curriculum" label="CURRICULUM" setOpen={setOpen} />
          <MobileLink to="/studentprofile" label="PROFILE" setOpen={setOpen} />

          <Link
            to="/logout"
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-red-600 font-semibold"
          >
            Logout
          </Link>
        </div>
      )}
    </header>
  )
}

/* Reusable Desktop Link */
const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="text-green-700 font-semibold hover:text-[#111725] transition"
  >
    {label}
  </Link>
)

/* Reusable Mobile Link */
const MobileLink = ({ to, label, setOpen }) => (
  <Link
    to={to}
    onClick={() => setOpen(false)}
    className="block px-6 py-3 text-green-700 font-semibold hover:bg-[#e6f6ee]"
  >
    {label}
  </Link>
)

export default StudentNav
