import React, { useState } from "react";

const SmartTask = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTask = async () => {
    console.log("🟡 Get Task clicked");
    setLoading(true);

    const token = localStorage.getItem("access");
    console.log("🟡 Access token:", token);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/task/generate/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🟡 Response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Backend error:", text);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("🟢 Task data:", data);

      setTask(data);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    }

    setLoading(false);
  };

  const markDone = async () => {
    const token = localStorage.getItem("access");

    try {
      await fetch("http://127.0.0.1:8000/api/task/complete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task_id: task.id }),
      });

      setTask(null);
      alert("Task completed 🎉");
    } catch (err) {
      console.error("❌ Complete task failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        ⏱ 10–20 Minute Smart Task
      </h2>

      {loading && <p>Generating task...</p>}

      {!task && !loading && (
        <button
          onClick={getTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Get Task
        </button>
      )}

      {task && (
        <>
          <h3 className="font-medium text-lg">{task.title}</h3>
          <p className="mt-2 text-gray-700">{task.description}</p>

          <button
            onClick={markDone}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Mark as Done
          </button>
        </>
      )}
    </div>
  );
};

export default SmartTask;
