import React, { useEffect, useState, useRef } from "react";
import { Send, MoreVertical, UserCircle2, Trash2, X } from "lucide-react";

export default function ChatRoom({ friend, onDeleteFriend }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!friend) return;
    fetch(`http://localhost:8000/api/social/chats/${friend.id}/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch messages:", err));
  }, [friend]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !friend) return;
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch(`http://localhost:8000/api/social/chats/${friend.id}/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ content: newMsg }),
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMsg("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleDeleteFriend = async () => {
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch(`http://localhost:8000/tracker/delete-friend/${friend.friendship_id}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      setMenuOpen(false);
      onDeleteFriend?.(friend.friendship_id);
    } catch (err) {
      console.error("Failed to delete friend:", err);
    }
  };

  const handleDeleteChats = async () => {
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch(`http://localhost:8000/api/social/chats/${friend.id}/clear/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setMessages([]);
    } catch (err) {
      console.error("Failed to delete chats:", err);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleProfile = () => {
    window.location.href = `http://localhost:8000/profile/${friend.username}/`;
  };

  if (!friend) {
    return (
      <div className="flex flex-1 h-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No conversation selected</h3>
          <p className="text-slate-500">Choose a friend from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-md">
            {friend.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">{friend.username}</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-600 font-medium">Online</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
              >
                <UserCircle2 className="w-4 h-4" />
                View Profile
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-t border-slate-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete Chats
              </button>
              <button
                onClick={handleDeleteFriend}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-slate-100"
              >
                <X className="w-4 h-4" />
                Delete Friend
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No messages yet</p>
              <p className="text-slate-400 text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === friend.username ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                  m.sender === friend.username
                    ? "bg-white text-slate-800 rounded-tl-none"
                    : "bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-tr-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border border-slate-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleSend}
            className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMsg.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Confirm Deletion</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete all chats with <strong className="text-slate-900">{friend.username}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChats}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                Delete Chats
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}