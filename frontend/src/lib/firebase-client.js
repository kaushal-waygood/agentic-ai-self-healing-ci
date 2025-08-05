// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyDvwUH477o1QDT58ku4H41DFaGXD6_d4CA',
//   authDomain: 'vs-code-466406.firebaseapp.com',
//   projectId: 'vs-code-466406',
//   storageBucket: 'vs-code-466406.firebasestorage.app',
//   messagingSenderId: '584491493872',
//   appId: '1:584491493872:web:3b27632cba8fb301021535',
//   measurementId: 'G-5KL75MS8V4',
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDvwUH477o1QDT58ku4H41DFaGXD6_d4CA',
  authDomain: 'vs-code-466406.firebaseapp.com',
  projectId: 'vs-code-466406',
  storageBucket: 'vs-code-466406.firebasestorage.app',
  messagingSenderId: '584491493872',
  appId: '1:584491493872:web:3b27632cba8fb301021535',
  measurementId: 'G-5KL75MS8V4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
