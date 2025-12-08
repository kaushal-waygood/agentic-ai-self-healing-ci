import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configuration
export const options = {
    // You can pass these as flags too, e.g. k6 run --vus 10 --duration 30s script.js
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

const BASE_URL = 'http://localhost:8080/api/v1';

export default function () {
    const uniqueId = randomString(8);
    const timestamp = Date.now();

    const payload = JSON.stringify({
        fullName: `K6 Load User ${uniqueId}`,
        email: `k6User_${uniqueId}_${timestamp}@test.k6.io`,
        password: 'password123',
        confirmPassword: 'password123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(`${BASE_URL}/user/signup`, payload, params);

    check(res, {
        'is status 201': (r) => r.status === 201,
        'res body has success': (r) => r.body.includes('Verification OTP sent') || r.body.includes('success'),
    });

    // Optional: Add a small sleep to simulate real user pacing, 
    // though for "data population" you might want to run as fast as possible.
    sleep(0.1);
}
