import React, { useEffect, useState } from "react"
import AttendanceIndividual from "./AttendanceIndividual"
import { Link } from "react-router-dom"

const AttendanceIndividualMain = () => {
  const [attendance, setAttendance] = useState([])
  const [totalAttendance, setTotalAttendance] = useState(0)

  useEffect(() => {
    const attendanceData = [
      {
        subject: "Data Structures",
        presentClasses: 18,
        totalClasses: 20,
        teacherName: "Dr. Mani",
        courseCode: "CSE201",
        syllabusUrl: "/syllabus/data-structures.pdf",
      },
      {
        subject: "Algorithms",
        presentClasses: 15,
        totalClasses: 22,
        teacherName: "Prof. Lokesh Reddy",
        courseCode: "CSE210",
        syllabusUrl: "/syllabus/algorithms.pdf",
      },
      {
        subject: "Operating Systems",
        presentClasses: 20,
        totalClasses: 25,
        teacherName: "Mrs. Sai Sagar",
        courseCode: "CSE301",
        syllabusUrl: "/syllabus/os.pdf",
      },
      {
        subject: "DBMS",
        presentClasses: 17,
        totalClasses: 20,
        teacherName: "Dr. Kiran",
        courseCode: "CSE220",
        syllabusUrl: "/syllabus/dbms.pdf",
      },
      {
        subject: "Computer Networks",
        presentClasses: 19,
        totalClasses: 24,
        teacherName: "Dr. Isha",
        courseCode: "CSE310",
        syllabusUrl: "/syllabus/cn.pdf",
      },
    ]

    setAttendance(attendanceData)
    setTotalAttendance(75)
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-4">
      <div className="bg-white rounded-3xl shadow-md p-5">
        <h1 className="text-center text-2xl font-semibold text-green-700">
          Attendance
        </h1>

        {/* LIST */}
        <div className="mt-5 max-h-[300px] overflow-y-auto pr-2">
          {attendance.map((item) => (
            <AttendanceIndividual
              key={item.courseCode}
              {...item}
            />
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex items-center mt-5">
          <h1 className="text-sm md:text-lg font-medium">
            Total attendance:{" "}
            <span className="text-green-700 font-semibold">
              {totalAttendance}%
            </span>
          </h1>

          <Link
            to="/scanqr"
            className="ml-auto px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition text-sm"
          >
            Scan QR
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AttendanceIndividualMain
