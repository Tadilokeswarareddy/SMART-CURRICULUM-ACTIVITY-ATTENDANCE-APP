import React, { useState } from "react";

const SmartTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState({});

  const getTasks = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/task/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          setError("Invalid response format from backend.");
        }
      } else {
        setError(data?.detail || data?.error || "Failed to fetch tasks.");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Something went wrong while fetching tasks.");
    }

    setLoading(false);
  };

  const handleFileChange = (taskId, file) => {
    setSubmissions((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        file,
      },
    }));
  };

  const handleNoteChange = (taskId, note) => {
    setSubmissions((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        note,
      },
    }));
  };

  const handleSubmitAssignment = (taskId) => {
    const submission = submissions[taskId];

    if (!submission?.file && !submission?.note) {
      alert("Please upload a file or add some notes before submitting.");
      return;
    }

    alert(`Assignment submitted for Task ID ${taskId}`);

    setSubmissions((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        submitted: true,
      },
    }));
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

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        alert("Task completed");
      } else {
        alert(data?.error || "Failed to complete task.");
      }
    } catch (err) {
      console.error("Complete task failed:", err);
      alert("Something went wrong while completing task.");
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f6ee] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
            Smart Student Tasks
          </h1>
          <p className="text-gray-700 text-sm sm:text-base">
            Tasks that help you manage your free time
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-4 sm:p-6 md:p-8">
          {loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center p-6 text-center sm:text-left">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
              <span className="mt-3 sm:mt-0 sm:ml-4 text-black text-base sm:text-lg">
                Generating tasks...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {tasks.length === 0 && !loading && (
            <div className="text-center py-14">
              <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">
                generate your tasks 
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Generate tasks which will help you better understand the thing you learn in the uni
              </p>

              <button
                onClick={getTasks}
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-50 shadow-sm w-full sm:w-auto"
              >
                {loading ? "Generating..." : "Generate 5 New Tasks"}
              </button>
            </div>
          )}

          <div className="space-y-6">
            {Array.isArray(tasks) &&
              tasks.map((task, index) => {
                const submission = submissions[task.id] || {};

                return (
                  <div
                    key={task.id || index}
                    className="bg-[#f9fdfb] border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Task Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="inline-block bg-[#e6f6ee] text-black text-xs sm:text-sm px-3 py-1 rounded-full mb-3 border border-gray-200">
                            Task {index + 1}
                          </div>

                          <h3 className="font-bold text-xl sm:text-2xl text-black">
                            {task.title || "Untitled Task"}
                          </h3>

                          <p className="text-sm text-gray-600 italic mt-1">
                            {task.duration || 10} minutes
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        {task.description || "No description available."}
                      </p>

                      {/* File Upload */}
                      <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <label className="block font-medium text-black mb-2 text-sm sm:text-base">
                          Upload Assignment File
                        </label>

                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileChange(task.id, e.target.files[0])
                          }
                          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-xl p-3 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-medium hover:file:bg-gray-800"
                        />

                        {submission.file && (
                          <p className="text-sm text-green-700 mt-3 break-all">
                            Selected: {submission.file.name}
                          </p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <label className="block font-medium text-black mb-2 text-sm sm:text-base">
                          Add Notes / Explanation (Optional)
                        </label>

                        <textarea
                          rows="4"
                          placeholder="Write something about your submission..."
                          value={submission.note || ""}
                          onChange={(e) =>
                            handleNoteChange(task.id, e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-2xl p-3 bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none resize-none text-sm sm:text-base"
                        />
                      </div>

                      {/* Submission Status */}
                      {submission.submitted && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm sm:text-base font-medium">
                          Assignment submitted successfully
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleSubmitAssignment(task.id)}
                          className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-2xl text-sm sm:text-base font-medium transition"
                        >
                          Submit Assignment
                        </button>

                        <button
                          onClick={() => markDone(task.id)}
                          className="w-full sm:w-auto bg-[#e6f6ee] hover:bg-[#d7efe3] text-black px-5 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 transition"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {tasks.length > 0 && (
            <button
              onClick={() => {
                setTasks([]);
                setSubmissions({});
              }}
              className="mt-8 text-sm sm:text-base text-gray-600 hover:text-black block mx-auto transition"
            >
              Clear all tasks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTask;