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
    // #region agent log
    if (typeof config.url === 'string' && config.url.includes('/students/jobs/recommended')) {
        fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H7',location:'tests/utils/axiosConfig.js:9',message:'Axios request before auth injection',data:{url:config.url,hasIncomingAuth:typeof config.headers?.Authorization==='string'&&config.headers.Authorization.length>0,incomingAuthPrefix:typeof config.headers?.Authorization==='string'?config.headers.Authorization.slice(0,20):null,hasConstantsToken:!!constants.ACCESS_TOKEN},timestamp:Date.now()})}).catch(()=>{});
        console.log('[agent-debug reco axios before]', {
            url: config.url,
            hasIncomingAuth: typeof config.headers?.Authorization === 'string' && config.headers.Authorization.length > 0,
            incomingAuthPrefix: typeof config.headers?.Authorization === 'string' ? config.headers.Authorization.slice(0, 20) : null,
            hasConstantsToken: !!constants.ACCESS_TOKEN,
            hasExplicitAuthHeader,
            skipAuthInjection,
        });
    }
    // #endregion
    if (!skipAuthInjection && !hasExplicitAuthHeader && constants.ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${constants.ACCESS_TOKEN}`;
    }
    // #region agent log
    if (typeof config.url === 'string' && config.url.includes('/students/jobs/recommended')) {
        fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H7',location:'tests/utils/axiosConfig.js:16',message:'Axios request after auth injection',data:{url:config.url,hasFinalAuth:typeof config.headers?.Authorization==='string'&&config.headers.Authorization.length>0,finalAuthPrefix:typeof config.headers?.Authorization==='string'?config.headers.Authorization.slice(0,20):null},timestamp:Date.now()})}).catch(()=>{});
        console.log('[agent-debug reco axios after]', {
            url: config.url,
            hasFinalAuth: typeof config.headers?.Authorization === 'string' && config.headers.Authorization.length > 0,
            finalAuthPrefix: typeof config.headers?.Authorization === 'string' ? config.headers.Authorization.slice(0, 20) : null,
            hasExplicitAuthHeader,
            skipAuthInjection,
        });
    }
    // #endregion
    return config;
});

export default axiosInstance;
