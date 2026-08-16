import React from "react";

const HabitLogList = ({ logs }) => (
  <div className="mt-4">
    <h4 className="font-semibold mb-2">Recent Logs</h4>
    <ul>
      {logs.map((log) => (
        <li key={log.id} className="text-sm text-gray-700">
          {log.date} — {log.status}
        </li>
      ))}
    </ul>
  </div>
);

export default HabitLogList;
