import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.send',
];

const BACKEND_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NODE_ENV === 'development'
      ? 'https://api.dev.zobsai.com'
      : 'http://127.0.0.1:8080';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_API_BASE_URL}/api/v1/user/oauth2callback`,
);
