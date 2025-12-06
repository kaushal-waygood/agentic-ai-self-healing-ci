import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration
export const options = {
    // Simulating search traffic. 
    // You can override these with flags: k6 run --vus 50 --duration 30s script.js
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<0.01'],   // http errors should be less than 1%
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms (search might be heavier)
    },
};

const BASE_URL = 'http://localhost:8080/api/v1';

export default function () {
    // Query parameters as requested
    const params = {
        // country: 'india',
        // state: 'delhi',
        // employmentType: 'contractor',
        // experience: '1',
        // datePosted: 'day',
        limit: '1000',
        page: '1',
        q: 'software engineer in uk'
    };

    // Construct query string
    const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    const url = `${BASE_URL}/jobs/search?${queryString}`;

    const res = http.get(url);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'has data array': (r) => JSON.parse(r.body).data !== undefined,
        'is success': (r) => JSON.parse(r.body).success === true,
    });

    // Random sleep between 0.1s and 0.5s to simulate user read time/typing
    sleep(Math.random() * 0.4 + 0.1);
}
