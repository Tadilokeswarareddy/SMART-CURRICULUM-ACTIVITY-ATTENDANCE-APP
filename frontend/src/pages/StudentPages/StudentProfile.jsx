import React, { useState, useEffect } from "react";
import StudentNav from "../../components/StudentNav";
import profilePic from '../../media/mahesh.webp'

const StudentProfile = () => {

  const [profile, setProfile] = useState({
    id: "12213492",
    firstName: "Lokesh",
    lastName: "Reddy",
    phoneNumber: "9866246178",
    email: "lokeshreddytadi@gmail.com",
    course: "B.Tech CSE",
    section: "k22UT",
    attendance: "85%",
    className: "4-2",
    yearStart: "2022",
    yearEnd: "2026",
  });

  // Later you can fetch from backend here
  // useEffect(() => {
  //   // api.get('/student/profile').then(res => setProfile(res.data));
  // }, []);

  return (
    <>
      <StudentNav />
      <div className="flex flex-col items-center justify-center min-h-screen pt-24">
        {/* Profile avatar */}
        <img
      src={profilePic}
  alt="Profile"
  className="w-40 h-40 rounded-full object-cover border"
/>

        {/* Roll number / ID */}
        <h1 className="mt-5 text-lg font-semibold">{profile.id}</h1>

        {/* Details card */}
        <div className="border h-auto w-[800px] mt-10 rounded-xl p-8 bg-white">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Student Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phoneNumber}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                value={profile.email}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Course */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Course</label>
              <input
                type="text"
                value={profile.course}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Section */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Section</label>
              <input
                type="text"
                value={profile.section}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Attendance */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Attendance</label>
              <input
                type="text"
                value={profile.attendance}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Class */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Class</label>
              <input
                type="text"
                value={profile.className}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Year of starting */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Year of Starting
              </label>
              <input
                type="text"
                value={profile.yearStart}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Year of ending */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Year of Ending</label>
              <input
                type="text"
                value={profile.yearEnd}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
