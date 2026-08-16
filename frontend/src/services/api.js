import axios from "axios";

const API_URL = "http://localhost:8000/api/social"; // Use localhost for cookie compatibility

// Axios global config
axios.defaults.withCredentials = true; // ensures cookies are sent with every request

// CSRF bootstrap
export async function getCsrfToken() {
  const response = await axios.get("http://localhost:8000/api/social/csrf/");
  const token = response.data.csrfToken;

  // Optional: verify it matches the cookie
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (token !== cookieToken) {
    console.warn("CSRF token mismatch:", { token, cookieToken });
  }

  return token;
}

// Generic API wrapper
async function apiRequest(endpoint, options = {}) {
  const csrfToken = await getCsrfToken();

  const headers = {
    "X-CSRFToken": csrfToken,
    ...options.headers,
  };

  // Avoid setting Content-Type for FormData
  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const method = options.method || "GET";
  const url = `${API_URL}${endpoint}`;
  const data = options.body || null;

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.status, error.response?.data);
    throw new Error(`Request failed with status ${error.response?.status}`);
  }
}
// ---------- Posts ----------
export const fetchPosts = () => apiRequest("/posts/");
export const createPost = (content, image = null) => {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);
  return apiRequest("/posts/", { method: "POST", body: formData });
};

export const toggleLike = async (postId) => {
  if (!postId) throw new Error("postId is undefined");
  const res = await fetch(`/api/social/posts/${postId}/like/`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

export const addComment = (postId, text) =>
  apiRequest(`/posts/${postId}/comment/`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
export const deletePost = (postId) =>
  apiRequest(`/posts/${postId}/`, { method: "DELETE" });

// ---------- Messaging ----------
export const fetchFriends = () => apiRequest("/chats/");
export const fetchMessages = (friendId) => apiRequest(`/chats/${friendId}/`);
export const sendMessage = (friendId, content) =>
  apiRequest(`/chats/${friendId}/send/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

// COMMUNITIES
export const createCommunity = (data) => 
  apiRequest('/communities/create/', {
    method: "POST",
    body: JSON.stringify(data), // Remove the extra {data} wrapper
  });

export function listCommunities() {
  return apiRequest('/communities/list/', { // Remove leading slash for consistency
    method: 'GET',
  });
}

export function joinCommunity(id) {
  return apiRequest(`/communities/${id}/join/`, { // Changed from GET to POST
    method: 'GET',
  });
}

export function reportUser(reported_user_id, reason) {
  return apiRequest(`/communities/report/?reported_user_id=${reported_user_id}&reason=${encodeURIComponent(reason)}`, {
    method: 'GET',
  });
}

  



