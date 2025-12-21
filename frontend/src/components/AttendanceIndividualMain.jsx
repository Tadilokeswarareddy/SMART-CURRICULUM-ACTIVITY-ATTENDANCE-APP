import React from 'react'
import AttendanceIndividual from './AttendanceIndividual'
import { Link } from 'react-router-dom';
import { useEffect,useState } from 'react';
const AttendanceIndividualMain = () => {
  const [attendance, setAttendance] = useState([]);
  const [totalAttendance, setTotalAttendance] = useState(0);

  useEffect(() => {
    const attendanceData = [
      {
        subject: "Data Structures",
        presentClasses: 18,
        totalClasses: 20,
        teacherName: "Dr. Mani",
        courseCode: "CSE201",
      },
      {
        subject: "Algorithms",
        presentClasses: 15,
        totalClasses: 22,
        teacherName: "Prof. Lokesh Reddy",
        courseCode: "CSE210",
      },
      {
        subject: "Operating Systems",
        presentClasses: 20,
        totalClasses: 25,
        teacherName: "Mrs. Sai Sagar",
        courseCode: "CSE301",
      },
      {
        subject: "DBMS",
        presentClasses: 17,
        totalClasses: 20,
        teacherName: "Dr. Kiran",
        courseCode: "CSE220",
      },
      {
        subject: "Computer Networks",
        presentClasses: 19,
        totalClasses: 24,
        teacherName: "Dr. Isha",
        courseCode: "CSE310",
      },
    ];
    setAttendance(attendanceData);
    setTotalAttendance(75);
  }, []);
  return (
    <div className="border h-[450px] w-[650px] ml-28 rounded-3xl p-5">
          <h1 className="flex justify-center mt-2 text-2xl font-semibold">
            ATTENDANCE
          </h1>
          <div className="border h-[300px] mt-5 rounded-xl overflow-y-auto p-3">
            {attendance.map((item) => (
              <AttendanceIndividual
                key={item.courseCode}
                subject={item.subject}
                presentClasses={item.presentClasses}
                totalClasses={item.totalClasses}
                teacherName={item.teacherName}
                courseCode={item.courseCode}
              />
            ))}
          </div>

          <div className="flex items-center mt-5">
            <h1 className="text-lg font-medium">
              Total attendance: {totalAttendance}%
            </h1>
            <div className="ml-auto">
              <Link
                to="/scanqr"
                className="px-5 py-2 bg-[#111725] text-white rounded-md"
              >
                Scan QR
              </Link>
            </div>
          </div>
        </div>

  )
}

export default AttendanceIndividualMain