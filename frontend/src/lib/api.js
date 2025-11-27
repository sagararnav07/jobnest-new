import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api/v1/user",
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Don't add token for auth routes
    if (!config.url.includes('/auth/')) {
      const token = localStorage.getItem('jn_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Auto logout if 401 response returned from api
        localStorage.removeItem('jn_token');
        delete api.defaults.headers.common.Authorization;
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', {
        url: error.config?.url,
        method: error.config?.method,
      });
      return Promise.reject({ 
        message: 'No response from server. Please check your connection.' 
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
      return Promise.reject({ 
        message: error.message || 'Error setting up request' 
      });
    }
  }
);

// Helper function to handle API responses
export const unwrap = async (requestPromise) => {
  try {
    const { data } = await requestPromise;
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Create a proper error object with all the details
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    const apiError = new Error(errorMessage);
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    apiError.isNetworkError = !error.response;
    apiError.isTimeout = error.code === 'ECONNABORTED';
    
    throw apiError;
  }
};

/**
 * Set or clear the authentication token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jn_token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jn_token');
    delete api.defaults.headers.common.Authorization;
  }
};

/**
 * Load stored token from localStorage
 */
export const loadStoredToken = () => {
  const token = localStorage.getItem('jn_token');
  if (token) {
    setAuthToken(token);
  }
  return token || null;
};

// Initialize with stored token on load
loadStoredToken();

export default api;
