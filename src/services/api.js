import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: `http://hamiltondinnerapp.staging.intelligrp.com/api/`,
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
    if (Cookies.get('authToken')) {
      token = JSON.parse(Cookies.get('authToken')).token;
    }
    // Use cookie token if available, otherwise fallback to localStorage
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
  (response) => response, // If response is successful, return it
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear authentication data (cookies/localStorage)
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      Cookies.remove('userToken'); // Ensure the correct cookie key is removed

      window.location.href = '/login'; // Redirect to the login page
    }
    return Promise.reject(error);
  }
);

const responseBody = (response) => response.data;

const requests = {
  get: (url, params, headers) =>
    instance.get(url, { params, headers }).then(responseBody),

  post: (url, body) => instance.post(url, body).then(responseBody),

  uploadPosts: (url, body) =>
    instance.post(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(responseBody),
    
  uploadPut: (url, body) =>
    instance.post(url, body, {
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

  put: (url, body) => instance.put(url, body).then(responseBody),

  patch: (url, body) => instance.patch(url, body).then(responseBody),

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