// Example of what your apiRequest might look like
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function apiRequest(endpoint, options = {}) {
  const baseURL = 'http://localhost:8000/tracker/api/'; // Adjust as needed
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add CSRF token for non-GET requests
  if (options.method && options.method !== 'GET') {
    defaultHeaders['X-CSRFToken'] = getCookie('csrftoken');
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };
  
  return fetch(`${baseURL}${endpoint}`, config)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}
// Assuming your apiRequest function is already defined and handles base URL + credentials + CSRF

export function getUserTasks() {
  return apiRequest('companion/tasks/', {
    method: 'GET',
  });
}

export function completeTask(taskId) {
  return apiRequest('companion/complete/', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export function getUserRewards() {
  return apiRequest('companion/rewards/', {
    method: 'GET',
  });
}