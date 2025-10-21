'use client';

import React, { useState, useEffect } from 'react';
import './launch.css';
import apiInstance from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';

const LAUNCH_DATE = new Date('2025-10-21T09:00:00');

const LaunchCountdown = () => {
  const calculateTimeLeft = () => {
    const difference = +LAUNCH_DATE - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };
  const { user } = useSelector((state: RootState) => state.auth);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [email, setEmail] = useState(user?.email);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      const response = await apiInstance.post('/user/notify-autopilot', {
        email,
      });
      setIsSubmitted(true);
    }
  };

  useEffect(() => {
    const response = async () => {
      const response = await apiInstance.post('/user/notify-autopilot-email', {
        email,
      });
      setIsSubmitted(response.data.sent);
    };
    response();
  }, []);

  const timerComponents = Object.keys(timeLeft).map((interval) => (
    <div key={interval} className="timer-segment">
      {/* <span className="timer-number">{timeLeft[interval]}</span> */}
      <span className="timer-label">
        {interval.charAt(0).toUpperCase() + interval.slice(1)}
      </span>
    </div>
  ));

  return (
    <div className="countdown-container">
      <h1 className="countdown-title">
        The Future of Job Searching is Almost Here.
      </h1>
      <p className="countdown-subtitle">
        Our new <strong>AI-Powered Auto-Apply Agent</strong> is launching soon.
        Stop spending hours on applications and let your personalized agent find
        and apply to the best jobs for you, 24/7.
      </p>

      <div className="timer-wrapper">
        <span className="timer-label text-blue-500 dark:text-blue-400 text-4xl">
          Launched In 2 Weeks
        </span>
      </div>

      {/* --- NEWSLETTER SIGNUP FORM --- */}
      <div className="newsletter-section">
        {!isSubmitted ? (
          <>
            <p className="newsletter-prompt">
              Be the first to know when we launch!
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="newsletter-input"
                required
                disabled={isSubmitted}
              />
              <button type="submit" className="newsletter-button">
                Notify Me
              </button>
            </form>
          </>
        ) : (
          <p className="success-message">
            ✅ You're on the list! We'll email you the moment it's live.
          </p>
        )}
      </div>
      {/* --- END NEWSLETTER --- */}

      <div className="features-preview">
        <h3>What's Coming?</h3>
        <ul>
          <li>✓ Create a personalized job-seeking "agent" in minutes.</li>
          <li>✓ Your agent automatically scans thousands of listings.</li>
          <li>✓ AI-driven application tailoring for better response rates.</li>
          <li>✓ Applies to jobs for you, even while you sleep.</li>
        </ul>
      </div>
    </div>
  );
};

export default LaunchCountdown;
