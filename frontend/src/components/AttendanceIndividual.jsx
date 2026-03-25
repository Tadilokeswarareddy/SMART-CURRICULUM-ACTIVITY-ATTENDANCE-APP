import React from "react"

const AttendanceIndividual = ({
  subject,
  presentClasses,
  totalClasses,
  teacherName,
  courseCode,
  syllabusUrl,
}) => {
  const percentage =
    totalClasses > 0
      ? Math.round((presentClasses / totalClasses) * 100)
      : 0

  const dashArray = 100
  const dashOffset = dashArray - (percentage / 100) * dashArray
  const absentClasses = totalClasses - presentClasses

  return (
    <>
      <div className="flex items-start gap-4 mt-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-[70px] h-[70px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-gray-200"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-green-600"
                strokeWidth="2"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>

            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-700">
              {percentage}%
            </span>
          </div>

          <span className="text-[11px] mt-1 text-gray-500">
            Attendance
          </span>
        </div>
        <div className="text-sm">
          <h1 className="text-base font-semibold text-gray-800">
            {subject}
          </h1>

          <p>
            Teacher:{" "}
            <span className="font-medium">{teacherName}</span>
          </p>

          <p>
            Course Code:{" "}
            <span className="font-medium">{courseCode}</span>
          </p>

          <p>
            Classes:{" "}
            <span className="font-medium">
              {presentClasses}/{totalClasses}
            </span>{" "}
            present ({absentClasses} absent)
          </p>

          {syllabusUrl && (
          <a
            href={syllabusUrl}
  download
  className="
    inline-flex items-center justify-center
    mt-2 px-5 py-1.5
    text-sm font-medium
    rounded-full
    border border-black
    text-black
    bg-[#e6f6ee]
    hover:bg-orange-50
    transition
  "
>
  Syllabus
</a>

          )}
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 my-4"></div>
    </>
  )
}

export default AttendanceIndividual
