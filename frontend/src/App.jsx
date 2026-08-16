// frontend/src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// 🧭 Common Layout
import Navbar from "./components/common/Navbar";

// 💬 Social
import ChatLayout from "./components/social/ChatLayout";
import PostCard from "./components/social/PostCard";
// import Communities from "./components/social/Community";

// 💪 Habits
import HabitsPage from "./pages/habits/HabitsPage";
import HabitLogsPage from "./pages/habits/HabitLogsPage";

// 🧠 Emotions
import EmotionDashboard from "./pages/emotions/EmotionDashboard";
import AdaptiveWorkoutsPage from "./pages/emotions/AdaptiveWorkoutsPage";

// 🧠 Companion Tasks
import CompanionWidget from "./components/companion/CompanionWidget";

function App() {
  return (
    <React.Fragment>
      {/* 🧠 CompanionWidget for Django template injection */}
      <div id="companion-root">
        <CompanionWidget />
      </div>

      {/* Full React Router App */}
      <BrowserRouter>
        {/* Persistent Navbar */}
        <Navbar />

        {/* Page Container */}
        <div className="pt-16 px-4 min-h-screen bg-gray-100 text-gray-800 relative">
          <Routes>
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/habits" />} />

            {/* 💬 Social */}
            <Route path="/chat" element={<ChatLayout />} />
            <Route path="/post" element={<PostCard />} />
            {/* <Route path="/communities" element={<Communities />} /> */}

            {/* 💪 Habits */}
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/habit-logs" element={<HabitLogsPage />} />

            {/* 🧠 Emotions */}
            <Route path="/emotions" element={<EmotionDashboard />} />
            <Route path="/adaptive-workouts" element={<AdaptiveWorkoutsPage />} />

            {/* 🧭 Fallback */}
            <Route
              path="*"
              element={
                <div className="text-center mt-10 text-lg">
                  <p>404 — Page Not Found</p>
                </div>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
