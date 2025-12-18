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

    const data = {
        jobDescription: 'Junior Web Developer\n\nPayrate: $40 W2 or $45 C2C\nHybrid – 2 days onsite in New York, NY\n\nQualifications:\n- 3+ years’ experience in C# development\n- 3+ years’ experience in UI development\n- Strong organizational and communication skills\n- Ability to work under pressure and meet tight deadlines\n- Ability to manage multiple projects simultaneously\n- Attention to detail and strong commitment to quality\n- Ability to work independently and in a team-oriented, collaborative environment\n\nTechnical Skills:\n- Microsoft SQL Server\n- C#\n- .NET Core\n- Web API development\n- Windows service development\n- Angular\n- Kendo UI controls\n- GIT\n\nBenefits:\n- Payrate: $40 W2 or $45 C2C',
        useProfile: 'false',
        cv: 'software engineer in uk'
    };

    const url = `${BASE_URL}/students/resume/generate/jd`;

    const res = http.post(url, data);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'has data array': (r) => JSON.parse(r.body).data !== undefined,
        'is success': (r) => JSON.parse(r.body).success === true,
    });

    // Random sleep between 0.1s and 0.5s to simulate user read time/typing
    sleep(Math.random() * 0.4 + 0.1);
}
