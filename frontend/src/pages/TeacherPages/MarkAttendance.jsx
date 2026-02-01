import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import TeacherNav from "../../components/TeacherNav";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:15 - 12:15",
  "01:00 - 02:00",
];

const classes = [
  { id: 1, name: "CSE - A" },
  { id: 2, name: "CSE - B" },
  { id: 3, name: "IT - A" },
];

const MarkAttendance = () => {
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  const [qrValue, setQrValue] = useState("");
  const [counter, setCounter] = useState(10);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    generateQR();

    const qrInterval = setInterval(() => {
      generateQR();
      setCounter(10);
    }, 10000);

    const countdown = setInterval(() => {
      setCounter((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdown);
    };
  }, [isActive]);

  const generateQR = () => {
    const payload = {
      day,
      time,
      classId: selectedClass.id,
      generatedAt: Date.now(),
      nonce: Math.random().toString(36).substring(2, 8),
    };

    setQrValue(JSON.stringify(payload));
  };

  const canStart =
    day && time && selectedClass && !isActive;

  return (
    <>
      <TeacherNav />

      <div className="flex min-h-[calc(100vh-80px)] bg-gray-100 border-1 mt-5">
        
        {/* LEFT PANEL */}
        <div className="w-1/3 bg-white p-6 border-r">
          <h2 className="text-xl font-semibold mb-6">
            Attendance Setup
          </h2>

          {/* Day */}
          <label className="block mb-2 text-sm font-medium">
            Select Day
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="">-- Choose Day --</option>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          {/* Time */}
          <label className="block mb-2 text-sm font-medium">
            Select Time Slot
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="">-- Choose Time --</option>
            {timeSlots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* Class */}
          <label className="block mb-2 text-sm font-medium">
            Select Section
          </label>
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`w-full text-left px-4 py-2 mb-2 rounded
                ${
                  selectedClass?.id === cls.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {cls.name}
            </button>
          ))}

          {/* Start / Stop */}
          {!isActive ? (
            <button
              disabled={!canStart}
              onClick={() => setIsActive(true)}
              className={`w-full mt-6 py-2 rounded text-white
                ${
                  canStart
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Start Attendance
            </button>
          ) : (
            <button
              onClick={() => setIsActive(false)}
              className="w-full mt-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Stop Attendance
            </button>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-2/3 flex items-center justify-center">
          {!isActive ? (
            <p className="text-gray-500 text-lg">
              Attendance not started
            </p>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-1">
                {selectedClass.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {day} · {time}
              </p>

              <QRCodeCanvas value={qrValue} size={280} />

              <p className="mt-4 text-sm text-gray-600">
                QR refreshes in <b>{counter}s</b>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarkAttendance;
