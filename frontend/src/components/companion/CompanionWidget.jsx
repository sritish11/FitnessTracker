import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Trophy, Coins, ChevronRight } from 'lucide-react';
import { getUserTasks, completeTask } from '../../services/companion';

export default function CompanionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState({ total_points: 0, total_rupees: 0 });
  const [loading, setLoading] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getUserTasks();
      setTasks(data.tasks || []);
      setRewards({
        total_points: data.total_points,
        total_rupees: data.total_rupees
      });
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, points) => {
    setCompletingTask(taskId);
    try {
      const data = await completeTask(taskId);
      
      // Show reward animation
      setLastEarnedPoints(points);
      setShowRewardPopup(true);
      setTimeout(() => setShowRewardPopup(false), 2000);
      
      // Update rewards
      setRewards({
        total_points: data.total_points,
        total_rupees: data.total_rupees
      });
      
      // If new batch of tasks
      if (data.new_batch) {
        setShowWave(true);
        setTimeout(() => setShowWave(false), 3000);
      }
      
      // Update tasks
      setTasks(data.next_tasks || []);
      
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingTask(null);
    }
  };

  return (
    <>
      {/* Floating Companion Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 group"
      >
        <Sparkles className="w-7 h-7 text-white animate-pulse" />
        {tasks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-bounce">
            {tasks.length}
          </span>
        )}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></div>
      </button>

      {/* Wave Animation */}
      {showWave && (
        <div className="fixed bottom-6 right-6 w-16 h-16 z-40 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-50" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}

      {/* Reward Popup */}
      {showRewardPopup && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
          <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold">
            <Coins className="w-5 h-5" />
            +{lastEarnedPoints} pts
          </div>
        </div>
      )}

      {/* Companion Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-20 translate-y-20"></div>
            </div>
            
            <div className="relative flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Daily Tasks
                </h2>
                <p className="text-purple-100 text-sm">Complete to earn rewards!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rewards Display */}
            <div className="mt-4 flex gap-3">
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="flex items-center gap-2 text-white">
                  <Coins className="w-5 h-5" />
                  <div>
                    <div className="text-xs opacity-80">Points</div>
                    <div className="text-xl font-bold">{rewards.total_points}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5" />
                  <div>
                    <div className="text-xs opacity-80">Earnings</div>
                    <div className="text-xl font-bold">₹{rewards.total_rupees.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">All tasks completed!</p>
                <p className="text-gray-400 text-sm mt-1">Check back tomorrow</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="group bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-purple-200"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-orange-600 font-semibold">
                            <Coins className="w-4 h-4" />
                            <span>{task.points} pts</span>
                          </div>
                          
                          <button
                            onClick={() => handleCompleteTask(task.id, task.points)}
                            disabled={completingTask === task.id}
                            className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {completingTask === task.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Completing...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Complete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Complete tasks to earn more!</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}