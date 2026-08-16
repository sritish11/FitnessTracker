import axios from "axios";

// Create Axios instance with base config
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/", // Update if using a different port or domain
  withCredentials: true, // Ensures cookies (sessionid, csrftoken) are sent
});

// Helper: Extract CSRF token from cookies
function getCookie(name) {
  const cookies = document.cookie?.split(";") || [];
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

// Request interceptor: Inject CSRF token for unsafe methods
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("csrftoken");
    const method = config.method?.toLowerCase();

    if (token && ["post", "put", "patch", "delete"].includes(method)) {
      config.headers["X-CSRFToken"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for global error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
