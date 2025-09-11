import axios from 'axios';

const apiClient = axios.create({
  // By removing the baseURL, we ensure all paths are absolute and clear.
  // This works perfectly with the updated Vite proxy.
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

export default apiClient;

