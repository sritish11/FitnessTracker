import React, { useEffect, useState } from "react";
import { getAdaptiveWorkouts } from "../../services/emotionsApi";
import AdaptiveWorkoutCard from "../../components/emotions/AdaptiveWorkoutCard";

const AdaptiveWorkoutsPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getAdaptiveWorkouts();
      setWorkouts(data);
    } catch (err) {
      setError("Failed to fetch workouts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleGenerateWorkout = () => {
    // Simulate AI suggestion
    const newWorkout = {
      id: Date.now(),
      title: "Quick Energy Booster",
      description: "10 push-ups + 20 squats + 30 jumping jacks",
      intensity: "Medium",
    };
    setWorkouts([newWorkout, ...workouts]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-indigo-600">Adaptive Workouts</h2>

      <button
        onClick={handleGenerateWorkout}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
      >
        Generate Suggested Workout
      </button>

      {loading && <p className="text-gray-500">Loading workouts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && workouts.length === 0 && <p className="text-gray-400">No adaptive workouts yet.</p>}

      <div className="flex flex-col gap-4">
        {workouts.map((w) => (
          <AdaptiveWorkoutCard key={w.id} workout={w} />
        ))}
      </div>
    </div>
  );
};

export default AdaptiveWorkoutsPage;
