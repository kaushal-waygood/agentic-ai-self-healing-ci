'use client';

import { useState } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import GoogleAuthButton from '../GoogleAuthButton';
import { initializeApp } from 'firebase/app';
import { useDispatch, useSelector } from 'react-redux';

const firebaseConfig = {
  apiKey: 'AIzaSyDvwUH477o1QDT58ku4H41DFaGXD6_d4CA',
  authDomain: 'vs-code-466406.firebaseapp.com',
  projectId: 'zobsai-592f0',
  storageBucket: 'vs-code-466406.firebasestorage.app',
  messagingSenderId: '584491493872',
  appId: '1:584491493872:web:3b27632cba8fb301021535',
  measurementId: 'G-5KL75MS8V4',
};

initializeApp(firebaseConfig);

const JobApplicationForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    recruiterEmail: '',
    jobTitle: '',
    coverLetter: '',
  });

  const { student: user } = useSelector((state) => state.student);

  // Monitor Firebase auth state
  useState(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        currentUser
          .getIdToken()
          .then((token) => localStorage.setItem('idToken', token));
      } else {
        setUser(null);
        localStorage.removeItem('idToken');
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/user/apply',
        {
          recruiterEmail: formData.recruiterEmail,
          jobTitle: formData.jobTitle,
          coverLetter: formData.coverLetter,
          idToken: localStorage.getItem('idToken'),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
        },
      );
      alert('Application sent successfully!');
      setFormData({ recruiterEmail: '', jobTitle: '', coverLetter: '' });
    } catch (error) {
      alert('Failed to send application');
    }
  };

  if (!user) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {!isAuthenticated ? (
        <div>
          <h2 className="text-xl mb-4">Authenticate with Google</h2>
          <GoogleAuthButton onSuccess={() => setIsAuthenticated(true)} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl">Job Application</h2>
          <input
            type="email"
            name="recruiterEmail"
            value={formData.recruiterEmail}
            onChange={handleChange}
            placeholder="Recruiter Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Job Title"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Cover Letter"
            className="w-full p-2 border rounded"
            rows="5"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
};

export default JobApplicationForm;
