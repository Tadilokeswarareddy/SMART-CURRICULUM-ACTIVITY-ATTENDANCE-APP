import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import StudentNav from "../../components/StudentNav";

const Scanqr = () => {
  const scannerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const startCamera = async () => {
    console.log("START CAMERA clicked");
    if (isRunning) {
      console.log("Camera already running");
      return;
    }
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          console.log("QR SCANNED:", decodedText);
        }
      );

      console.log("Camera started");
      setIsRunning(true);
    } catch (err) {
      console.error("Camera start failed:", err);
    }
  };
  const stopCamera = async () => {
    console.log("STOP CAMERA clicked");
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        console.log("Scanner stopped");
      }
      document.querySelectorAll("video").forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
        }
      });
      setIsRunning(false);
      console.log(" Camera hardware OFF");
    } catch (err) {
      console.warn("Stop error:", err);
    }
  };
  return (
    <>
      <StudentNav />

      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-100 gap-4">
        <h2 className="text-xl font-semibold">Scan Attendance QR</h2>

        <div
          id="qr-reader"
          className="w-[280px] h-[210px] bg-black rounded-lg overflow-hidden"
        />

        <div className="flex gap-4">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Scan QR
          </button>

          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Stop Scan
          </button>
        </div>
      </div>
    </>
  );
};

export default Scanqr;
