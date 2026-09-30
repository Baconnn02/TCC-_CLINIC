import axios from "axios";

const apiBaseUrl =
    import.meta.env.VITE_API_URL ||
    "https://tcc-clinic-management-system-1.onrender.com/api";

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;