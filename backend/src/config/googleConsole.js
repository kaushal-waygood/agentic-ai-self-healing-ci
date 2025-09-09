import { google } from 'googleapis';

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

// CORRECTED CONSTRUCTOR: Remove the third argument
export const oauth2Client = new google.auth.OAuth2(
  '433624775795-8jhe519p7bncje5e7hl17m3rh5ttmkng.apps.googleusercontent.com',
  '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',
  'http://127.0.0.1:8080/api/v1/user/oauth2callback',
);

// You no longer need the googleRedirectURI array here
