import React from "react"

const StudentMessage = ({ title, message }) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 leading-tight">
        {title}
      </h2>

      <p className="text-xs text-gray-600 mt-1">
        {message}
      </p>

      <div className="w-full h-px bg-gray-200 mt-3"></div>
    </div>
  )
}

export default StudentMessage
