import axios from "axios"
axios.interceptors.request.use(
    (response) => {
        /* If the response is successful, return the response data */
        return response.data;
    },
  (config) => {
    const token = sessionStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosApi
