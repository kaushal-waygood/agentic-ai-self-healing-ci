import admin from 'firebase-admin';
// import serviceAccount  from './config.json';
import { config } from './firbaseconfig.js';

admin.initializeApp({
  credential: admin.credential.cert(config),
});

export default admin;
