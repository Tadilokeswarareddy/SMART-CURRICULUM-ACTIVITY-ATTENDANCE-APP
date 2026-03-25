import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import TeacherNav from "../../components/TeacherNav";

const MarkAttendance = () => {
  const [assignmentId, setAssignmentId] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [counter, setCounter] = useState(300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    startAttendance();

    const countdown = setInterval(() => {
      setCounter((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [isActive]);

  const startAttendance = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/attendance/start/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            assignment_id: assignmentId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start attendance");
        return;
      }

      setQrValue(data.qr_token);
      setCounter(300);
    } catch (err) {
      console.error("Attendance start error:", err);
    }
  };

  return (
    <>
      <TeacherNav />

      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-100">
        {!isActive ? (
          <div className="bg-white p-6 rounded shadow w-80">
            <h2 className="text-lg font-semibold mb-4">
              Start Attendance
            </h2>

            <input
              type="number"
              placeholder="Teaching Assignment ID"
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              disabled={!assignmentId}
              onClick={() => setIsActive(true)}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Start Attendance
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded shadow text-center">
            <h3 className="text-lg font-semibold mb-3">
              Scan to Mark Attendance
            </h3>

            <QRCodeCanvas value={qrValue} size={260} />

            <p className="mt-4 text-sm text-gray-600">
              Expires in <b>{counter}s</b>
            </p>

            <button
              onClick={() => setIsActive(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              Stop Attendance
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MarkAttendance;
