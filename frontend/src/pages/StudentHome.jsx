import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AttendanceIndividual from "../components/AttendanceIndividual";
import StudentMessage from "../components/StudentMessage";
import StudentNav from "../components/StudentNav";

const StudentHome = () => {
  const [attendance, setAttendance] = useState([]);
  const [messages, setMessages] = useState([]);
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

    const messagesData = [
      {
        id: 1,
        title: "Assignment Submission",
        message: "Submit Data Structures Lab 3 by Friday 5 PM on LMS.",
      },
      {
        id: 2,
        title: "Lab Rescheduled",
        message: "OS Lab rescheduled to Monday 2 PM.",
      },
      {
        id: 3,
        title: "Exam Reminder",
        message: "CSE201 midterm on Thursday at 10 AM.",
      },
      {
        id: 4,
        title: "Project Groups",
        message: "Form groups of 4 for DBMS mini-project.",
      },
      {
        id: 4,
        title: "Project Groups",
        message: "Form groups of 4 for DBMS mini-project.",
      },
      {
        id: 5,
        title: "Project Groups",
        message: "Form groups of 4 for DBMS mini-project.",
      },
      {
        id: 6,
        title: "Project Groups",
        message: "Form groups of 4 for DBMS mini-project.",
      },
      {
        id: 7,
        title: "Project Groups",
        message: "Form groups of 4 for DBMS mini-project.",
      },
    ];

    setAttendance(attendanceData);
    setMessages(messagesData);
    setTotalAttendance(75);
  }, []);

  return (
    <div className="">
      <StudentNav/>

      <div className="flex gap-40 mt-32 ">
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
        <div className="border h-[450px] w-[350px] rounded-3xl bg-white">
          <h1 className="flex justify-center mt-3 text-2xl font-semibold">
            MESSAGES
          </h1>
          <div className="w-full h-px bg-black my-3"></div>

          <div className="overflow-y-auto h-[330px] px-2">
            {messages.map((msg) => (
              <StudentMessage
                key={msg.id}
                title={msg.title}
                message={msg.message}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
