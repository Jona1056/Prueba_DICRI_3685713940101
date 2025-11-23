import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error.response)
    const msg = error.response.data.msg || error.response.data.errors[0].msg;


    if (error.response?.status === 401) {
      const logout = useAuthStore.getState().logout();
          logout();
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por favor inicia sesión nuevamente.",
      });
      window.location.href = "/login";
      return Promise.reject(error);
    }


    


    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });

    return Promise.reject(error);
    
  }
);

export default api;
