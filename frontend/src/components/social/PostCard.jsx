import React, { useState } from "react";
import { toggleLike, addComment } from "../../services/api";

export default function PostCard({ post = {} }) {
  // Always call hooks first
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [comment, setComment] = useState("");

  // If post is null/undefined, render fallback
  if (!post) {
    return (
      <div className="bg-white shadow-md rounded-xl p-4 mb-4 text-gray-400">
        Post data not available.
      </div>
    );
  }

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      setLikes(res?.likes ?? likes);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const newComment = await addComment(post.id, comment);
      setComments([...comments, newComment]);
      setComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-4 hover:shadow-lg transition">
      <h4 className="font-semibold text-indigo-700">{post.user || "Anonymous"}</h4>
      <p className="mt-1">{post.content || ""}</p>

      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full h-64 object-cover rounded mt-2"
        />
      )}

      <div className="flex items-center mt-3 space-x-4">
        <button
          onClick={handleLike}
          className="text-blue-600 hover:text-blue-800 transition"
        >
          👍 {likes}
        </button>
      </div>

      <div className="mt-3">
        {comments.length > 0 ? (
          comments.map((c, idx) => (
            <p key={c.id || idx} className="text-sm">
              <strong>{c.user || "Anonymous"}:</strong> {c.text || ""}
            </p>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No comments yet.</p>
        )}

        <form onSubmit={handleComment} className="mt-2 flex">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="grow border p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button className="ml-2 bg-gray-200 px-3 rounded hover:bg-gray-300 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
