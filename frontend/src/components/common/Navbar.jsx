import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/habits", label: "HabitForge" },
    { path: "/emotions", label: "MindSync" },
    { path: "/adaptive-workouts", label: "Adaptive Workouts" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">CARES4U</h1>
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === item.path
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
