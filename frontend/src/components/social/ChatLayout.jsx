import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import Community from "./Community";

export default function ChatLayout() {
  const location = useLocation();
  const [selectedFriend, setSelectedFriend] = useState(location.state?.friend || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCommunities, setShowCommunities] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/social/current-user/", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setCurrentUser(data);
      } catch (err) {
        setError("Failed to load user information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  const handleAddFriend = () => {
    window.location.href = "http://localhost:8000/tracker/friend-requests/";
  };

  const handleFriendDeleted = () => {
    setSelectedFriend(null);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (showCommunities) {
    return (
      <div>
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SocialHub
            </h1>
            <button
              onClick={() => setShowCommunities(false)}
              className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Back to Messages
            </button>
          </div>
        </div>
        <Community />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b bg-linear-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-900">{currentUser?.username || "Messages"}</h2>
            <button
              onClick={handleAddFriend}
              className="p-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              title="Add Friend"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowCommunities(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
          >
            <Users className="w-4 h-4" />
            View Communities
          </button>
        </div>
        <ChatList
          onSelectFriend={setSelectedFriend}
          currentUser={currentUser}
          refreshKey={refreshKey}
          selectedFriend={selectedFriend}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 p-4">
        {selectedFriend ? (
          <ChatRoom
            friend={selectedFriend}
            currentUser={currentUser}
            onDeleteFriend={handleFriendDeleted}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
