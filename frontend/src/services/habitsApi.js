// import apiClient from "./apiClient";

// export const getHabits = async () => (await apiClient.get("habits/")).data;
// export const addHabit = async (habit) => (await apiClient.post("habits/create/", habit)).data;
// export const getHabitLogs = async (habitId) => (await apiClient.get(`habits/${habitId}/logs/`)).data;
// export const addHabitLog = async (habitId, status) => 
//   (await apiClient.post(`habits/${habitId}/logs/add/`, { status })).data;


import apiClient from "./apiClient";

// 📋 Get all habits for current user
export const getHabits = async () => {
  const response = await apiClient.get("habits/");
  return response.data;
};

// ➕ Create a new habit
export const addHabit = async (habit) => {
  const response = await apiClient.post("habits/create/", habit);
  return response.data;
};

// 📈 Get all habit logs (optional: backend can filter by user or habit)
export const getHabitLogs = async () => {
  const response = await apiClient.get("habitlogs/");
  return response.data;
};

// 🗓️ Create a new habit log entry
export const addHabitLog = async (habitId, status) => {
  const response = await apiClient.post("habitlogs/create/", {
    habit_id: habitId,
    status,
  });
  return response.data;
};

// 🔒 Get CSRF token (optional, if you want to trigger it manually)
export const getCSRFToken = async () => {
  const response = await apiClient.get("csrf/");
  return response.data;
};
