import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import StudentNav from "../../components/StudentNav";

const Scanqr = () => {
  const scannerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const startCamera = async () => {
    if (isRunning) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    setHasScanned(false);

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (hasScanned) return;
          setHasScanned(true);
          markAttendance(decodedText);
        }
      );

      setIsRunning(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }
      setIsRunning(false);
    } catch (err) {
      console.warn(err);
    }
  };

  const markAttendance = async (qrToken) => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/attendance/mark/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            qr_token: qrToken,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        stopCamera();
      } else {
        alert(data.error || "Attendance failed");
        setHasScanned(false);
      }
    } catch (err) {
      console.error("Attendance error:", err);
    }
  };

  return (
    <>
      <StudentNav />

      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-100 gap-4">
        <h2 className="text-xl font-semibold">
          Scan Attendance QR
        </h2>

        <div
          id="qr-reader"
          className="w-[280px] h-[210px] bg-black rounded-lg"
        />

        <div className="flex gap-4">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Start Scan
          </button>

          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop Scan
          </button>
        </div>
      </div>
    </>
  );
};

export default Scanqr;
