import React, { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";

export default function ChatList({ onSelectFriend, refreshKey = 0, selectedFriend }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/social/chats", {
          credentials: "include",
        });
        const data = await response.json();
        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {friends.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">No friends yet</p>
          <p className="text-sm text-slate-500">Add friends to start chatting</p>
        </div>
      ) : (
        <div className="p-3">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className={`flex items-center w-full text-left p-3 mb-2 rounded-xl transition-all duration-200 ${
                selectedFriend?.id === friend.id
                  ? "bg-linear-to-r from-blue-50 to-purple-50 shadow-md scale-[1.02]"
                  : "hover:bg-slate-50 hover:shadow-sm"
              }`}
            >
              <div
                className={`h-12 w-12 flex items-center justify-center rounded-full font-bold text-white mr-3 shadow-sm transition-all ${
                  selectedFriend?.id === friend.id
                    ? "bg-linear-to-br from-blue-600 to-purple-600 scale-110"
                    : "bg-linear-to-br from-blue-500 to-purple-500"
                }`}
              >
                {friend.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold truncate ${
                    selectedFriend?.id === friend.id ? "text-blue-900" : "text-slate-900"
                  }`}>
                    {friend.username}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-slate-500">Online</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}