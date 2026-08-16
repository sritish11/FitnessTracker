import React, { useEffect, useState } from "react";
import { getEmotions, addEmotion } from "../../services/emotionsApi";
import EmotionLogForm from "../../components/emotions/EmotionLogForm";
import EmotionLogList from "../../components/emotions/EmotionLogList";

const EmotionDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const fetchEmotions = async () => {
      const data = await getEmotions();
      setLogs(data);
    };
    fetchEmotions();
  }, []);

  // 🧠 Generate motivational feedback
  const generateMessage = (emotion) => {
    const { mood, stress_level, energy } = emotion;

    if (energy >= 8 && mood === "happy") {
      return "🔥 You’re full of energy! Let’s do 200 squats or a power run!";
    } else if (energy >= 6 && stress_level <= 2) {
      return "💪 Great balance today — how about a 30-min yoga session?";
    } else if (stress_level >= 4) {
      return "😌 You seem stressed — take a walk, breathe, and rest today.";
    } else if (mood === "sad" || mood === "tired") {
      return "💖 Feeling low? Do 10 minutes of stretching to reset your mind.";
    } else {
      return "Keep it steady today. Small progress = big results!";
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    await addEmotion(data);
    const updated = await getEmotions();
    setLogs(updated);

    // 🧠 Simulate AI detection → popup feedback
    const message = generateMessage(data);
    setPopup(message);

    // Auto close popup after 5 seconds
    setTimeout(() => setPopup(null), 5000);
    setLoading(false);
  };

  return (
    <div className="relative p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">
        MindSync Fitness
      </h2>
      <p className="text-center text-gray-500 mb-6">
        Track your mood, stress, and energy — let AI guide your fitness journey.
      </p>

      <EmotionLogForm onSubmit={handleSubmit} disabled={loading} />
      <EmotionLogList logs={logs} />

      {/* Popup message */}
      {popup && (
        <div className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg animate-bounce">
          {popup}
        </div>
      )}
    </div>
  );
};

export default EmotionDashboard;
