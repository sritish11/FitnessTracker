import React, { useState, useEffect } from "react";
import { fetchPosts, createPost } from "../../services/api";
import PostCard from "./PostCard"; // make sure path is correct

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(Array.isArray(data) ? data : []); // safe fallback
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      setError(null);

      await createPost(newPost, image);

      setNewPost("");
      setImage(null);

      await loadPosts();
    } catch (err) {
      setError(err.message || "Failed to create post");
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* New Post Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring"
          rows="3"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="block w-full text-sm text-gray-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={posting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Posts Feed */}
      {loading ? (
        <p className="text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
