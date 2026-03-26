import axios from "axios";
import constants from "../config/constants.js";

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const skipAuthInjection =
        config.headers?.['X-Skip-Auth-Injection'] === '1' ||
        config.headers?.['x-skip-auth-injection'] === '1';
    const hasExplicitAuthHeader =
        typeof config.headers?.Authorization === 'string' ||
        typeof config.headers?.authorization === 'string';
   
    if (!skipAuthInjection && !hasExplicitAuthHeader && constants.ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${constants.ACCESS_TOKEN}`;
    }
   
    return config;
});

export default axiosInstance;
