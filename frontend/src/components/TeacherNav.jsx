import React from 'react'
import {Link} from 'react-router-dom'
const TeacherNav = () => {
  return (
  <div className="flex items-center justify-between w-full px-10 mt-6 ">
        <Link to="/teacherhome">
          <h1
            className="text-2xl font-bold cursor-pointer]"
            style={{ color: "#111725" }}
          >
            Shusseki
          </h1>
        </Link>

        <nav className="flex items-center gap-16 bg-white shadow-md border rounded-3xl px-10 h-14">
          <Link
            to="/teacherhome"
            className="text-blue-600 font-semibold hover:text-[#111725] transition"
          >
            HOME
          </Link>
          <Link
            to="/markattendance"
            className="text-blue-600 font-semibold hover:text-[#111725] transition"
          >
            MARK ATTENDANCE
          </Link>
          <Link
            to="/curriculum"
            className="text-blue-600 font-semibold hover:text-[#111725] transition"
          >
            TIME TABLE
          </Link>
          <Link
            to="/studentprofile"
            className="text-blue-600 font-semibold hover:text-[#111725] transition"
          >
            PROFILE
          </Link>
        </nav>

        <Link
          to="/logout"
          className="px-5 py-2 bg-red-600 text-white rounded-md"
        >
          Logout
        </Link>
      </div>

  )
}

export default TeacherNav