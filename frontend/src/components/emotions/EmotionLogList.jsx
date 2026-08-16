import React from "react";
import { deleteEmotion } from "../../services/emotionsApi";

const EmotionLogList = ({ logs, setLogs }) => {

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteEmotion(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      alert("Failed to delete emotion log.");
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2 text-gray-800">Recent Emotions</h4>
      <ul className="space-y-2">
        {logs.map((log) => {
          const timestamp = log.timestamp || log.date || log.created_at; // fallback field
          const timeStr = timestamp
            ? new Date(timestamp).toLocaleString()
            : "No timestamp";

          return (
            <li
              key={log.id}
              className="flex justify-between items-center bg-gray-50 p-2 rounded-xl shadow-sm"
            >
              <span className="text-sm text-gray-700">
                {timeStr} — {log.mood} | Energy {log.energy_level} | Stress {log.stress_level}
              </span>
              <button
                onClick={() => handleDelete(log.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default EmotionLogList;
