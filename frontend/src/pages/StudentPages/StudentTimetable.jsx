import StudentNav from '../../components/StudentNav'
import React, { useState } from "react";


const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timetable = {
  Monday: [
    {
      time: "09:00 - 10:00",
      subject: "DBMS",
      section: "CSE - A",
      room: "301",
    },
    {
      time: "10:00 - 11:00",
      subject: "Operating Systems",
      section: "IT - A",
      room: "204",
    },
  ],
  Tuesday: [
    {
      time: "11:15 - 12:15",
      subject: "Computer Networks",
      section: "CSE - B",
      room: "105",
    },
  ],
  Wednesday: [
    {
      time: "09:00 - 10:00",
      subject: "DBMS",
      section: "CSE - A",
      room: "301",
    },
    {
      time: "01:00 - 02:00",
      subject: "Software Engineering",
      section: "IT - A",
      room: "210",
    },
  ],
  Thursday: [],
  Friday: [
    {
      time: "10:00 - 11:00",
      subject: "AI Basics",
      section: "CSE - B",
      room: "401",
    },
  ],
};

const StudentTimetable = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");

  return (
    <>
      <StudentNav/>

      <div className="min-h-[calc(100vh-80px)] bg-gray-100 p-6 mt-5">
        
        {/* Day Selector */}
        <div className="flex gap-2 mb-6">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                ${
                  selectedDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedDay}'s Schedule
          </h2>

          {timetable[selectedDay].length === 0 ? (
            <p className="text-gray-500">
              No classes scheduled for this day.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetable[selectedDay].map((cls, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition"
                >
                  <p className="text-lg font-semibold mb-1">
                    {cls.subject}
                  </p>

                  <p className="text-sm text-gray-600 mb-2">
                    {cls.section}
                  </p>

                  <div className="mt-3 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {cls.time}
                    </p>
                    <p>
                      <span className="font-medium">Room:</span>{" "}
                      {cls.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};


export default StudentTimetable