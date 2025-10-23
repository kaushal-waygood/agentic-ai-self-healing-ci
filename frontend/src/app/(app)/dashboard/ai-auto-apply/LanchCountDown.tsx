'use client';

import React, { useState, useEffect } from 'react';
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
    <div key={interval} className="flex flex-col items-center">
      {/* <span className="text-3xl font-bold">{timeLeft[interval]}</span> */}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {interval.charAt(0).toUpperCase() + interval.slice(1)}
      </span>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4 ">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl  bg-gradient-to-r from-gray-900 font-bold via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
          The Future of Job Searching is Almost Here.
        </h1>
        <p className="text-base md:text-md text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Our new{' '}
          <strong className="text-gray-900 dark:text-white">
            AI-Powered Auto-Apply Agent
          </strong>{' '}
          is launching soon. Stop spending hours on applications and let your
          personalized agent find and apply to the best jobs for you, 24/7.
        </p>

        <div className="mb-10">
          <span className="inline-block text-2xl md:text-3xl font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-6 py-3 rounded-lg">
            Launching In 2 Weeks
          </span>
        </div>

        {/* --- NEWSLETTER SIGNUP FORM --- */}
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          {!isSubmitted ? (
            <>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Be the first to know when we launch!
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                  disabled={isSubmitted}
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-base font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Notify Me
                </button>
              </form>
            </>
          ) : (
            <p className="text-base text-green-600 dark:text-green-400 font-medium">
              ✅ You're on the list! We'll email you the moment it's live.
            </p>
          )}
        </div>
        {/* --- END NEWSLETTER --- */}

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 md:p-8 text-left">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
            What's Coming?
          </h3>
          <ul className="space-y-3 max-w-2xl mx-auto">
            <li className="flex items-start text-gray-700 dark:text-gray-300">
              <span className="text-green-500 mr-3 mt-0.5">✓</span>
              <span>Create a personalized job-seeking "agent" in minutes.</span>
            </li>
            <li className="flex items-start text-gray-700 dark:text-gray-300">
              <span className="text-green-500 mr-3 mt-0.5">✓</span>
              <span>Your agent automatically scans thousands of listings.</span>
            </li>
            <li className="flex items-start text-gray-700 dark:text-gray-300">
              <span className="text-green-500 mr-3 mt-0.5">✓</span>
              <span>
                AI-driven application tailoring for better response rates.
              </span>
            </li>
            <li className="flex items-start text-gray-700 dark:text-gray-300">
              <span className="text-green-500 mr-3 mt-0.5">✓</span>
              <span>Applies to jobs for you, even while you sleep.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LaunchCountdown;
