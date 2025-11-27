import api, { setAuthToken, unwrap } from "../lib/api";

// Helper to get user type from category
const resolveUserType = (category = '') => {
  if (category?.toLowerCase() === 'company') return 'Employeer';
  return 'Jobseeker';
};

// Helper to resolve display name
const resolveDisplayName = (displayName, additional = {}, fallbackEmail = '') => {
  if (displayName) return displayName;
  if (additional?.company) return additional.company;
  const joinedName = [additional?.first_name, additional?.last_name].filter(Boolean).join(' ').trim();
  if (joinedName) return joinedName;
  return fallbackEmail?.split('@')[0] || 'User';
};

/**
 * Register a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @param {string} [photoURL] - Optional profile photo URL
 * @param {Object} [additional={}] - Additional user data
 * @returns {Promise<Object>} User data
 */
export const register = async (email, password, displayName, photoURL, additional = {}) => {
  try {
    const payload = {
      name: resolveDisplayName(displayName, additional, email),
      emailId: email,
      password,
      userType: resolveUserType(additional?.category),
      photoURL: photoURL || null,
      ...additional,
    };
    
    // baseURL already includes /api/v1/user, so use /auth/signup here
    const response = await api.post("/auth/signup", payload);
    
    if (response.data?.token) {
      localStorage.setItem('jn_token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} [userType='Jobseeker'] - Type of user (Jobseeker or Employeer)
 * @returns {Promise<{user: Object, token: string}>} User data and auth token
 */
export const login = async (email, password, userType = 'Jobseeker') => {
  try {
    // baseURL already includes /api/v1/user, so use /auth/login here
    const response = await api.post(
      '/auth/login',
      { emailId: email, password, userType },
      { withCredentials: true }
    );

    const { user, token } = response.data;
    
    if (token) {
      localStorage.setItem('jn_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await unwrap(api.post("/auth/logout"));
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the token even if the server logout fails
  } finally {
    setAuthToken(null);
    // Clear any user data from local storage
    localStorage.removeItem('user');
  }
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<boolean>} True if request was successful
 */
export const forgotPassword = async (email) => {
  try {
    await unwrap(api.post("/auth/forgot-password", { email }));
    return true;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user's data
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const data = await unwrap(api.get("/users/me"));
    return data?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    // Clear invalid token if request fails
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    throw error;
  }
};

/**
 * Update current user's data
 * @param {Object} updatedData - Data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (updatedData) => {
  try {
    const data = await unwrap(api.patch("/users/me", updatedData));
    return data?.user || null;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};
