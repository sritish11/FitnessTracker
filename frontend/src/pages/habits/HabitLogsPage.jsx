import React, { useEffect, useState } from "react";
import { getHabitLogs, addHabitLog, getHabits } from "../../services/habitsApi";

function HabitLogsPage() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState("");
  const [status, setStatus] = useState("done");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Fetch habits and logs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [habitData, logData] = await Promise.all([
          getHabits(),
          getHabitLogs(),
        ]);
        setHabits(habitData);
        setLogs(logData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 📝 Add a new log entry
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!selectedHabit) return alert("Please select a habit first.");

    try {
      setLoading(true);
      await addHabitLog(selectedHabit, status);
      const updatedLogs = await getHabitLogs();
      setLogs(updatedLogs);
      setSelectedHabit("");
      setStatus("done");
    } catch (err) {
      setError("Failed to add habit log.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Habit Logs</h1>

      {/* Add New Habit Log */}
      <form onSubmit={handleAddLog} className="flex gap-3 mb-6">
        <select
          value={selectedHabit}
          onChange={(e) => setSelectedHabit(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2"
          required
        >
          <option value="">Select Habit</option>
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2"
        >
          <option value="done">Done</option>
          <option value="missed">Missed</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          Add Log
        </button>
      </form>

      {/* Logs List */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">History</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li
                key={log.id}
                className="border border-gray-200 rounded-xl p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{log.habit_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    log.status === "done"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {log.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HabitLogsPage;
