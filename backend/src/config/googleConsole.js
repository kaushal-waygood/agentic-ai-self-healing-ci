import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  '584491493872-k4r3sueu3m2j7fm5ancngm9i1018qp2j.apps.googleusercontent.com',
  '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',
  'http://localhost:8080/api/v1/user/oauth2callback',
);

export { SCOPES, oauth2Client };
