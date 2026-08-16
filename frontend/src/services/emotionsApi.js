import apiClient from "./apiClient";

// 🧠 Get all emotion logs
export const getEmotions = async () => {
  const response = await apiClient.get("emotions/");
  return response.data;
};

// ➕ Add a new emotion entry
export const addEmotion = async (emotionData) => {
  const response = await apiClient.post("emotions/create/", emotionData);
  return response.data;
};

// 🏋️‍♀️ Get adaptive workouts (AI-suggested or static)
export const getAdaptiveWorkouts = async () => {
  const response = await apiClient.get("adaptiveworkouts/");
  return response.data;
};

// 🧩 Add a new adaptive workout (based on mood or AI)
export const addAdaptiveWorkout = async (workoutData) => {
  const response = await apiClient.post("adaptiveworkouts/create/", workoutData);
  return response.data;
};

export const deleteEmotion = async (id) => {
  const response = await apiClient.delete(`emotions/delete/${id}/`);
  return response.data;
};
