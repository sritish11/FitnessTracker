import React from "react";

const intensityColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const AdaptiveWorkoutCard = ({ workout }) => {
  const { activity_type, intensity, suggestion_text, mood_tag } = workout;

  return (
    <div className="p-4 border rounded-2xl shadow-md mb-4 bg-white hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg text-gray-800">{activity_type}</h4>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${intensityColors[intensity] || "bg-gray-200 text-gray-800"}`}
        >
          {intensity}
        </span>
      </div>

      {mood_tag && (
        <p className="text-xs text-indigo-600 font-medium mb-1">
          Suggested for mood: {mood_tag}
        </p>
      )}

      <p className="text-gray-700">{suggestion_text}</p>
    </div>
  );
};

export default AdaptiveWorkoutCard;
