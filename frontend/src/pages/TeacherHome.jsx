import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import TeacherNav from "../components/TeacherNav"
import api from "../api"

const TeacherHome = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentStats, setStudentStats] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    api.get("/api/assignments/")
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.get("/api/task/teacher-stats/")
      .then((res) => setStudentStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setStatsLoading(false))
  }, [])

  const scoreColor = (score) => {
    if (score == null) return ""
    if (score >= 8) return "text-green-600"
    if (score >= 5) return "text-yellow-600"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#111725] mb-6">Dashboard</h1>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/markattendance"
            className="bg-white rounded-xl shadow p-5 hover:shadow-md transition flex flex-col gap-1 border-l-4 border-blue-500"
          >
            <h2 className="font-semibold text-[#111725]">Mark Attendance</h2>
            <p className="text-xs text-gray-400">QR or manual attendance</p>
          </Link>

          <Link
            to="/teachertimetable"
            className="bg-white rounded-xl shadow p-5 hover:shadow-md transition flex flex-col gap-1 border-l-4 border-green-500"
          >
            <h2 className="font-semibold text-[#111725]">Time Table</h2>
            <p className="text-xs text-gray-400">View your schedule</p>
          </Link>

          <Link
            to="/teachermessages"
            className="bg-white rounded-xl shadow p-5 hover:shadow-md transition flex flex-col gap-1 border-l-4 border-purple-500"
          >
            <h2 className="font-semibold text-[#111725]">Messages</h2>
            <p className="text-xs text-gray-400">Inbox &amp; send to sections</p>
          </Link>
        </div>

        {/* Classes overview */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-base font-semibold mb-4 text-[#111725]">Your Classes</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-400 text-sm">No classes assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:shadow-sm transition"
                >
                  <p className="font-semibold text-sm text-[#111725]">{a.subject.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.subject.code}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {a.section.branch.name} · {a.section.name}
                  </p>
                  <Link
                    to="/markattendance"
                    className="mt-3 inline-block text-xs text-blue-600 font-medium hover:underline"
                  >
                    Mark Attendance →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Task Performance */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#111725]">
              Student Task Performance
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
              AI-Graded
            </span>
          </div>

          {statsLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : studentStats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-gray-400 text-sm">No student submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase tracking-wide">
                      Student
                    </th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium text-xs uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-center py-2 pr-4 text-gray-400 font-medium text-xs uppercase tracking-wide">
                      Tasks Done
                    </th>
                    <th className="text-center py-2 text-gray-400 font-medium text-xs uppercase tracking-wide">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s) => (
                    <tr
                      key={s.student_id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 pr-4 font-medium text-[#111725]">
                        {s.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {s.email}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className="bg-green-50 text-green-700 font-semibold rounded-full px-3 py-1 text-xs">
                          {s.completed_tasks}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {s.average_score != null ? (
                          <span className={`font-bold text-sm ${scoreColor(s.average_score)}`}>
                            {s.average_score}/10
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">No submissions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherHome