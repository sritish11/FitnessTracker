import React, { useState } from "react";

const HabitForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title });
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        className="border p-2 rounded w-full"
        placeholder="Enter new habit..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Habit
      </button>
    </form>
  );
};

export default HabitForm;
