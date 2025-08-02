import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDvwUH477o1QDT58ku4H41DFaGXD6_d4CA',
  authDomain: 'vs-code-466406.firebaseapp.com',
  projectId: 'vs-code-466406',
  storageBucket: 'vs-code-466406.firebasestorage.app',
  messagingSenderId: '584491493872',
  appId: '1:584491493872:web:3b27632cba8fb301021535',
  measurementId: 'G-5KL75MS8V4',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
