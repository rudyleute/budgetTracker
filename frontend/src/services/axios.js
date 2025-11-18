import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_BACKEND_URL
  : 'http://localhost:8080';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Token retrieval failed:', error);

        return Promise.reject({
          status: null,
          statusText: 'Authentication Error',
          message: 'Failed to get authentication token. Please sign in again.',
          data: null
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorDetails = {
      status: null,
      statusText: null,
      message: 'An unexpected error occurred',
      data: null
    };

    if (error.response) {
      const { status, statusText, data } = error.response;

      errorDetails.status = status;
      errorDetails.statusText = statusText || 'Error';
      errorDetails.message = data?.message || getDefaultMessage(status);
      errorDetails.data = null;

    } else if (error.request) {
      errorDetails.status = 0;
      errorDetails.message = 'No response from server. Please check your connection.';
    } else {
      errorDetails.message = error.message || 'An unexpected error occurred';
      if (error.status !== undefined) {
        errorDetails.status = error.status;
        errorDetails.statusText = error.statusText;
        errorDetails.message = error.message;
        errorDetails.data = error.data;
      }
    }

    return errorDetails;
  }
);

const getDefaultMessage = (status) => {
  const messages = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    409: 'Resource already exists',
    500: 'Server error occurred',
    502: 'Bad gateway',
    503: 'Service unavailable'
  };

  return messages[status] || 'An error occurred';
};

const api = {
  get: (endpoint, params = {}) => instance.get(endpoint, { params }),
  post: (endpoint, data = {}) => instance.post(endpoint, data),
  put: (endpoint, data = {}) => instance.put(endpoint, data),
  delete: (endpoint) => instance.delete(endpoint)
};

export default api;