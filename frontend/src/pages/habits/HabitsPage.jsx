import React, { useEffect, useState } from "react";
import { getHabits, addHabit, addHabitLog } from "../../services/habitsApi";
import HabitCard from "../../components/habits/HabitCard";
import HabitForm from "../../components/habits/HabitForm";

const HabitsPage = () => {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    getHabits().then(setHabits);
  }, []);

  const handleAddHabit = async (data) => {
    await addHabit(data);
    const updated = await getHabits();
    setHabits(updated);
  };

  const handleLog = async (id, status) => {
    await addHabitLog(id, status);
    const updated = await getHabits();
    setHabits(updated);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">HabitForge</h2>
      <HabitForm onAdd={handleAddHabit} />
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} onLog={handleLog} />
      ))}
    </div>
  );
};

export default HabitsPage;
