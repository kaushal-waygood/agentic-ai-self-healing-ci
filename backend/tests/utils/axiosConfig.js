import axios from "axios";
import constants from "../config/constants.js";

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
    if (constants.ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${constants.ACCESS_TOKEN}`;
    }
    return config;
});

export default axiosInstance;
