import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import Class from '../media/classbro.svg'

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const SendRequest = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post("/api/token/", {
        username,
        password,
      })

      localStorage.setItem(ACCESS_TOKEN, response.data.access)
      localStorage.setItem(REFRESH_TOKEN, response.data.refresh)

      const role = response.data.role
      if (role === "student") navigate("/studenthome")
      else if (role === "teacher") navigate("/teacherhome")
      else navigate("/admin")
    } catch {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f7ef] px-4">
      <div
        className="
          w-full max-w-md
          md:max-w-4xl md:h-[520px]
          bg-white rounded-3xl shadow-xl
          flex flex-col md:flex-row
          overflow-hidden
        "
      >
        <div
          className="
            md:w-1/2
            bg-[#e6f6ee]
            flex flex-col items-center justify-center
            p-6 md:p-10
            text-center
          "
        >
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Shusseki
          </h1>

          <p className="text-gray-600 text-sm md:text-base mb-6">
            Smart Attendance & Curriculum Management
          </p>

          <div
            className="
              w-40 h-40
              md:w-64 md:h-64
              bg-green-100 rounded-xl
              flex items-center justify-center
              text-green-600 text-xs md:text-sm
            "
          >
            <img src={Class} alt="login" />

          </div>
        </div>
        <div
          className="
            md:w-1/2
            flex flex-col justify-center
            px-6 py-10 md:px-12
          "
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-1">
            Welcome to <span className="text-green-600">Shusseki</span>
          </h2>

          <p className="text-gray-500 text-sm mb-8">
            Sign in to continue
          </p>

          <form onSubmit={SendRequest} className="space-y-5">
            <input
              type="text"
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full border-b border-gray-300
                focus:outline-none focus:border-green-500
                py-2 text-sm
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full border-b border-gray-300
                focus:outline-none focus:border-green-500
                py-2 text-sm
              "
            />

            {error && (
              <p className="text-red-500 text-xs">
                {error}
              </p>
            )}

            <div className="text-right text-xs text-green-600 cursor-pointer">
              Forgot password?
            </div>

            <button
              type="submit"
              className="
                w-full bg-gray-800 text-white
                py-2.5 rounded-full
                hover:bg-gray-900 transition
                text-sm
              "
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
