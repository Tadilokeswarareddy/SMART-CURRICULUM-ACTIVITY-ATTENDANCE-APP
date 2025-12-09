import React from 'react';

const StudentMessage = ({ title, message }) => {
  return (
    <div className="p-2 bg-white ">
      <div className="flex justify-between items-start gap-3">
        <h2 className="text-sm font-semibold text-gray-900 leading-tight">
          {title}
        </h2>
      </div>
      <p className="text-xs text-black mt-0.5">
        {message}
      </p>
      <div className="w-full h-px bg-black my-2"></div>
    </div>
  );
};

export default StudentMessage;
