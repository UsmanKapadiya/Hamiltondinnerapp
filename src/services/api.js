import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `http://hamiltondinnerapp.staging.intelligrp.com/api/`,
  timeout: 50000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
instance.interceptors.request.use(
  function (config) {
    let token;
    
    // Try to get token from cookies first
    if (Cookies.get('authToken')) {
      try {
        const cookieData = JSON.parse(Cookies.get('authToken'));
        token = cookieData.token;
      } catch (e) {
        console.error('Failed to parse cookie token:', e);
      }
    }
    
    // Fallback to localStorage
    const authToken = token || localStorage.getItem('authToken');
    
    if (authToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `${authToken}`;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      Cookies.remove('authToken');
      Cookies.remove('userToken');

      // Redirect to login
      window.location.href = '/';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }
    
    return Promise.reject(error);
  }
);

const responseBody = (response) => response.data;

/**
 * Retry logic for failed requests
 */
const retryRequest = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (!error.response || error.response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const requests = {
  get: (url, params, headers) =>
    retryRequest(() => 
      instance.get(url, { params, headers }).then(responseBody)
    ),

  post: (url, body) => 
    retryRequest(() => 
      instance.post(url, body).then(responseBody)
    ),

  uploadPosts: (url, body) =>
    instance.post(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(responseBody),
    
  uploadPut: (url, body) =>
    instance.put(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(responseBody),

  customPost: (url, body, token) => {
    return instance.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then(responseBody);
  },

  put: (url, body) => 
    retryRequest(() => 
      instance.put(url, body).then(responseBody)
    ),

  patch: (url, body) => 
    retryRequest(() => 
      instance.patch(url, body).then(responseBody)
    ),

  delete: (url, body) =>
    instance.delete(url, { data: body }).then(responseBody),

  upload: (url, formData) =>
    instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(responseBody),
};

export default requests;