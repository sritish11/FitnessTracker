import React from "react";

const HabitCard = ({ habit, onLog }) => (
  <div className="p-3 border rounded-lg shadow-sm mb-3">
    <h4 className="font-semibold text-lg">{habit.title}</h4>
    <p className="text-sm text-gray-600">Streak: {habit.streak_count} days</p>
    <button
      onClick={() => onLog(habit.id, "done")}
      className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
    >
      Mark as Done
    </button>
  </div>
);

export default HabitCard;
