import axios from 'axios';

// This function sets up an "interceptor" that runs before every API request.
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      // Get the user data from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      
      // If the user and token exist, add the token to the request headers
      if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;