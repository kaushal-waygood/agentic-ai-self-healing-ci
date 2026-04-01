import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend, Rate } from 'k6/metrics';

/* ===================== CONFIG ===================== */

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],

    resume_jd_failures: ['rate<0.05'],
    cover_jd_failures: ['rate<0.05'],

    resume_jd_duration: ['p(95)<3000'],
    cover_jd_duration: ['p(95)<3000'],
  },
};

const BASE_URL = 'http://localhost:8080/api/v1';
const PASSWORD = 'Help@123';

/* ===================== CUSTOM METRICS ===================== */

// Resume APIs
export const resumeJDTrend = new Trend('resume_jd_duration');
export const resumeJDFailRate = new Rate('resume_jd_failures');

export const resumeJobIdTrend = new Trend('resume_jobid_duration');
export const resumeJobIdFailRate = new Rate('resume_jobid_failures');

export const resumeTitleTrend = new Trend('resume_title_duration');
export const resumeTitleFailRate = new Rate('resume_title_failures');

// Cover Letter APIs
export const coverJDTrend = new Trend('cover_jd_duration');
export const coverJDFailRate = new Rate('cover_jd_failures');

export const coverJobIdTrend = new Trend('cover_jobid_duration');
export const coverJobIdFailRate = new Rate('cover_jobid_failures');

export const coverTitleTrend = new Trend('cover_title_duration');
export const coverTitleFailRate = new Rate('cover_title_failures');

/* ===================== FILES (INIT CONTEXT ONLY) ===================== */
/**
 * IMPORTANT:
 * - Normal JS array (NOT SharedArray)
 * - open() allowed here
 * - Binary buffers reused safely
 */

const resumeFiles = [
  { name: 'resume1.pdf', data: open('./resumes/resume1.pdf', 'b') },
  { name: 'resume2.pdf', data: open('./resumes/resume2.pdf', 'b') },
  { name: 'resume3.pdf', data: open('./resumes/resume3.pdf', 'b') },
  { name: 'resume4.pdf', data: open('./resumes/resume4.pdf', 'b') },
  { name: 'resume5.pdf', data: open('./resumes/resume5.pdf', 'b') },
  { name: 'resume6.pdf', data: open('./resumes/resume6.pdf', 'b') },
  { name: 'resume7.pdf', data: open('./resumes/resume7.pdf', 'b') },
  { name: 'resume8.pdf', data: open('./resumes/resume8.pdf', 'b') },
  { name: 'resume9.pdf', data: open('./resumes/resume9.pdf', 'b') },
  { name: 'resume10.pdf', data: open('./resumes/resume10.pdf', 'b') },
  { name: 'resume11.pdf', data: open('./resumes/resume11.pdf', 'b') },
  { name: 'resume12.pdf', data: open('./resumes/resume12.pdf', 'b') },
  { name: 'resume13.pdf', data: open('./resumes/resume13.pdf', 'b') },
  { name: 'resume14.pdf', data: open('./resumes/resume14.pdf', 'b') },
  { name: 'resume15.pdf', data: open('./resumes/resume15.pdf', 'b') },
  { name: 'resume16.pdf', data: open('./resumes/resume16.pdf', 'b') },
  { name: 'resume17.pdf', data: open('./resumes/resume17.pdf', 'b') },
  { name: 'resume18.pdf', data: open('./resumes/resume18.pdf', 'b') },
  { name: 'resume19.pdf', data: open('./resumes/resume19.pdf', 'b') },
  { name: 'resume20.pdf', data: open('./resumes/resume20.pdf', 'b') },
  { name: 'resume21.pdf', data: open('./resumes/resume21.pdf', 'b') },
  { name: 'resume22.docx', data: open('./resumes/resume22.docx', 'b') },
  { name: 'resume23.docx', data: open('./resumes/resume23.docx', 'b') },
];

/* ===================== USERS (SETUP PHASE) ===================== */

export function setup() {
  const limit = __ENV.VUS || 10;

  const res = http.get(`${BASE_URL}/user/get-verified-users?limit=${limit}`);

  if (res.status !== 200) {
    throw new Error('Failed to fetch verified users');
  }

  return {
    users: JSON.parse(res.body),
  };
}

/* ===================== HELPERS ===================== */

function randomBool() {
  return Math.random() < 0.5;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function safeHasJobId(res) {
  try {
    return JSON.parse(res.body).jobId !== undefined;
  } catch {
    return false;
  }
}

/* ===================== LOGIN ===================== */

function login(email) {
  const res = http.post(
    `${BASE_URL}/user/signin`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, {
    'login success': (r) => r.status === 200,
    'accessToken present': (r) => {
      try {
        return JSON.parse(r.body).accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  return JSON.parse(res.body).accessToken;
}

/* ===================== RESUME APIs ===================== */

function resumeGenerateJD(token) {
  const start = Date.now();
  let res;

  const useProfile = randomBool();

  if (useProfile) {
    res = http.post(
      `${BASE_URL}/students/resume/generate/jd`,
      JSON.stringify({
        jobDescription: 'Backend developer role',
        useProfile: true,
      }),
      {
        headers: {
          ...authHeaders(token),
          'Content-Type': 'application/json',
        },
      },
    );
  } else {
    const file = randomItem(resumeFiles);
    res = http.post(
      `${BASE_URL}/students/resume/generate/jd`,
      {
        jobDescription: 'Backend developer role',
        useProfile: false,
        cv: http.file(file.data, file.name),
      },
      { headers: authHeaders(token) },
    );
  }

  resumeJDTrend.add(Date.now() - start);
  resumeJDFailRate.add(res.status >= 400);

  return res;
}

function resumeGenerateJobId(token) {
  const start = Date.now();
  let res;

  res = http.post(
    `${BASE_URL}/students/resume/generate/jobid`,
    JSON.stringify({
      jobId: '687e2695c5dde1531ccbb9dc',
      useProfile: true,
      finalTouch: 'Make it suitable for a fast-paced startup',
    }),
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
    },
  );

  resumeJobIdTrend.add(Date.now() - start);
  resumeJobIdFailRate.add(res.status >= 400);

  return res;
}

function resumeGenerateTitle(token) {
  const start = Date.now();
  let res;

  res = http.post(
    `${BASE_URL}/students/resume/generate/jobtitle`,
    JSON.stringify({
      title: 'Full stack MERNS',
      useProfile: true,
      finalTouch: 'Make it suitable for a fast-paced startup',
    }),
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
    },
  );

  resumeTitleTrend.add(Date.now() - start);
  resumeTitleFailRate.add(res.status >= 400);

  return res;
}

/* ===================== COVER LETTER APIs ===================== */

function coverGenerateJD(token) {
  const useProfile = randomBool();

  const start = Date.now();
  let res;

  if (useProfile) {
    res = http.post(
      `${BASE_URL}/students/coverletter/generate/jd`,
      JSON.stringify({
        jobDescription: 'Frontend developer role',
        useProfile: true,
      }),
      {
        headers: {
          ...authHeaders(token),
          'Content-Type': 'application/json',
        },
      },
    );
  } else {
    const file = randomItem(resumeFiles);
    res = http.post(
      `${BASE_URL}/students/coverletter/generate/jd`,
      {
        jobDescription: 'Frontend developer role',
        useProfile: false,
        cv: http.file(file.data, file.name),
      },
      { headers: authHeaders(token) },
    );
  }

  coverJDTrend.add(Date.now() - start);
  coverJDFailRate.add(res.status >= 400);

  return res;
}

function coverGenerateJobId(token) {
  const start = Date.now();
  let res;

  res = http.post(
    `${BASE_URL}/students/coverletter/generate/jobId`,
    JSON.stringify({
      jobId: '687e2695c5dde1531ccbb9dc',
      useProfile: true,
      finalTouch: 'Make it suitable for a fast-paced startup',
    }),
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
    },
  );

  coverJobIdTrend.add(Date.now() - start);
  coverJobIdFailRate.add(res.status >= 400);

  return res;
}

function coverGenerateTitle(token) {
  const start = Date.now();
  let res;

  res = http.post(
    `${BASE_URL}/students/coverletter/generate/title`,
    JSON.stringify({
      title: 'Full stack MERNS',
      useProfile: true,
      finalTouch: 'Make it suitable for a fast-paced startup',
    }),
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
    },
  );

  coverTitleTrend.add(Date.now() - start);
  coverTitleFailRate.add(res.status >= 400);

  return res;
}

/* ===================== MAIN TEST ===================== */

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  const token = login(user.email);

  const actions = [
    resumeGenerateJD,
    resumeGenerateJobId,
    resumeGenerateTitle,
    coverGenerateJD,
    coverGenerateJobId,
    coverGenerateTitle,
  ];

  for (const action of actions) {
    const res = action(token);

    check(res, {
      'request accepted': (r) =>
        r.status === 200 || r.status === 201 || r.status === 202,
      'jobId exists': (r) => safeHasJobId(r),
    });

    sleep(Math.random() * 0.5 + 0.2);
  }
}
