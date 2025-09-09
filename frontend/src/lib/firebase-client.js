import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBAZ6zskQHLSeoQiluoG7yKNDSQquJGX7o',
  authDomain: 'zobsai-592f0.firebaseapp.com',
  projectId: 'zobsai-592f0',
  storageBucket: 'zobsai-592f0.firebasestorage.app',
  messagingSenderId: '304190777942',
  appId: '1:304190777942:web:b93cdce76ce2f3915c29f7',
  measurementId: 'G-NTPZ57GVC2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
