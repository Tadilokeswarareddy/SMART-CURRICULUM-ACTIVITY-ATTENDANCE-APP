import React, { useState } from "react";

const SmartTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getTasks = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access");
    console.log("TOKEN:", token);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("RESPONSE DATA:", data);

      if (res.ok) {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array but got:", data);
          setError("Invalid response format from backend.");
        }
      } else {
        setError(data?.detail || data?.error || "Failed to fetch tasks.");
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setError("Something went wrong while fetching tasks.");
    }

    setLoading(false);
  };

  const markDone = async (taskId) => {
    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/complete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task_id: taskId }),
      });

      const data = await res.json();
      console.log("COMPLETE RESPONSE:", data);

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        alert("Task completed 🎉");
      } else {
        alert(data?.error || "Failed to complete task.");
      }
    } catch (err) {
      console.error("❌ Complete task failed:", err);
      alert("Something went wrong while completing task.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        ⏱ Your 10–20 Minute Smart Tasks
      </h2>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Generating tasks...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-10">
          <button
            onClick={getTasks}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate 5 New Tasks"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {Array.isArray(tasks) &&
          tasks.map((task, index) => (
            <div
              key={task.id || index}
              className="border border-gray-100 p-4 rounded-lg bg-gray-50 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">
                    {task.title || "Untitled Task"}
                  </h3>
                  <p className="text-sm text-gray-500 italic mb-2">
                    {task.duration || 10} minutes
                  </p>
                  <p className="text-gray-700">
                    {task.description || "No description available."}
                  </p>
                </div>

                <button
                  onClick={() => markDone(task.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition shrink-0 ml-4"
                >
                  Done
                </button>
              </div>
            </div>
          ))}
      </div>

      {tasks.length > 0 && (
        <button
          onClick={() => setTasks([])}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 block mx-auto"
        >
          Clear all tasks
        </button>
      )}
    </div>
  );
};

export default SmartTask;