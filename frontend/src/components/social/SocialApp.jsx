import React, { useEffect, useState } from "react";
import { fetchPosts, createPost, toggleLike, addComment } from "../../services/api";
// import { useNavigate } from "react-router-dom";

export default function SocialApp() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const navigate = useNavigate();

  // Load posts safely
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Create new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const newPost = await createPost(content, image);
      setPosts([newPost, ...posts]);
      setContent("");
      setImage(null);
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  // Like a post
  const handleLike = async (postId) => {
    if (!postId) return;
    try {
      await toggleLike(postId);
      const updated = await fetchPosts();
      setPosts(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  // Add comment
  const handleComment = async (postId, text, resetInput) => {
    if (!text.trim()) return;
    try {
      await addComment(postId, text);
      const updated = await fetchPosts();
      setPosts(Array.isArray(updated) ? updated : []);
      if (resetInput) resetInput("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Open ChatLayout


  return (
    <div className="max-w-2xl mx-auto p-6 bg-linear-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* New Post Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-5 mb-6 border border-gray-200"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          rows="3"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="block text-sm text-gray-500 my-2"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Post
        </button>
      </form>

      {/* Loading or Error */}
      {loading && <p className="text-gray-500 text-center">Loading posts...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow-md border border-gray-200 rounded-2xl p-5 mb-5"
        >
          <h4 className="font-semibold text-indigo-700">{post.user}</h4>
          <p className="text-gray-800 mt-1">{post.content}</p>

          {post.image && (
            <img
              src={post.image}
              alt="post"
              className="w-full h-64 object-cover rounded-xl mt-3"
            />
          )}

          <div className="flex items-center mt-4 space-x-4">
            <button
              onClick={() => handleLike(post.id)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition"
            >
              👍 <span className="ml-1">{post.likes}</span>
            </button>

            
          </div>

          <div className="mt-4">
            {Array.isArray(post.comments) && post.comments.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {post.comments.map((c) => (
                  <p key={c.id} className="text-sm text-gray-700">
                    <strong>{c.user}</strong>: {c.text}
                  </p>
                ))}
              </div>
            )}

            <CommentInput postId={post.id} onSubmit={handleComment} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Comment input subcomponent
function CommentInput({ postId, onSubmit }) {
  const [text, setText] = useState("");

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Write a comment..."
      className="mt-3 w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit(postId, text, setText);
        }
      }}
    />
  );
}
