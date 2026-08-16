import React, { useState } from "react";

const EmotionLogForm = ({ onSubmit, disabled }) => {
  const [mood, setMood] = useState("neutral");
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ mood, stress_level: stress, energy });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl"
    >
      <select
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="happy">😊 Happy</option>
        <option value="neutral">😐 Neutral</option>
        <option value="sad">😞 Sad</option>
        <option value="tired">😴 Tired</option>
        <option value="stressed">😣 Stressed</option>
      </select>

      <label className="text-gray-600">
        Stress Level: {stress}
        <input
          type="range"
          min="1"
          max="5"
          value={stress}
          onChange={(e) => setStress(e.target.value)}
          className="w-full mt-1"
        />
      </label>

      <label className="text-gray-600">
        Energy Level: {energy}
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
          className="w-full mt-1"
        />
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
      >
        {disabled ? "Saving..." : "Log Emotion"}
      </button>
    </form>
  );
};

export default EmotionLogForm;
