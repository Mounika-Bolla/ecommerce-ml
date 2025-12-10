import axios from 'axios'

// Set base URL for API
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

export default axios
