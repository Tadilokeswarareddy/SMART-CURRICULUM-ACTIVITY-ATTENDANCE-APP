import React from 'react'

const AttendanceIndividual = ({
  subject,
  presentClasses,
  totalClasses,
  teacherName,
  courseCode,
}) => {
  const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const dashArray = 100;
  const dashOffset = dashArray - (percentage / 100) * dashArray;

  const absentClasses = totalClasses - presentClasses;

  return (
    <>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: "75px", height: "75px" }}>
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-gray-200"
                strokeWidth="2"
              ></circle>


              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-blue-600"
                strokeWidth="2"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              ></circle>
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <span className="text-center text-xl font-bold text-blue-600">
                {percentage}%
              </span>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-500">Attendance</span>
        </div>


        <div className="flex flex-col text-sm">
          <h1 className="text-base font-semibold">{subject}</h1>
          <p>Teacher: <span className="font-medium">{teacherName}</span></p>
          <p>Course Code: <span className="font-medium">{courseCode}</span></p>
          <p>
            Classes:{" "}
            <span className="font-medium">
              {presentClasses}/{totalClasses} present
            </span>{" "}
            ({absentClasses} absent)
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-black my-4"></div>
    </>
  )
}

export default AttendanceIndividual
