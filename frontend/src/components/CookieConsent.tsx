'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Cookie, Settings, X } from 'lucide-react';

// Define the shape of the consent object
interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if the user has already made a choice
    const consentCookie = Cookies.get('cookie_consent');
    if (!consentCookie) {
      setShowBanner(true);
    }
  }, []);

  const handlePreferenceChange = (category: keyof ConsentPreferences) => {
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const setCookieAndHide = (preferences: ConsentPreferences) => {
    // Cookie expires in 1 year
    Cookies.set('cookie_consent', JSON.stringify(preferences), {
      expires: 365,
    });
    setShowBanner(false);
    setShowPreferences(false);
    // Reload to apply script changes
    window.location.reload();
  };

  const handleAcceptAll = () => {
    const allConsents: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setCookieAndHide(allConsents);
  };

  const handleDeclineAll = () => {
    const necessaryOnly: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setCookieAndHide(necessaryOnly);
  };

  const handleSavePreferences = () => {
    setCookieAndHide(consent);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* --- Main Cookie Banner Ribbon --- */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        aria-labelledby="cookie-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-screen-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Cookie className="w-10 h-10 text-purple-600" />
          </div>
          <div className="flex-grow text-sm text-center sm:text-left">
            <h2 id="cookie-title" className="font-bold text-gray-900 text-lg">
              We Value Your Privacy
            </h2>
            <p className="text-gray-600 mt-1">
              We use cookies to enhance your browsing experience and analyze our
              traffic. By clicking "Accept All", you consent to our use of
              cookies. Read our{' '}
              <Link
                href="/privacy-policy"
                className="text-purple-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-6 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors duration-200 w-full sm:w-auto"
            >
              Preferences
            </button>
            <button
              onClick={handleDeclineAll}
              className="px-6 py-3 rounded-xl font-semibold bg-red-100 hover:bg-red-200 text-red-700 transition-colors duration-200 w-full sm:w-auto"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* --- Preferences Modal --- */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowPreferences(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Cookie Preferences
              </h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Manage your settings. You can enable or disable different types of
              cookies below.
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">
                  Necessary Cookies
                </span>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-not-allowed"
                  checked
                  disabled
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="font-semibold text-gray-700">
                  Analytics Cookies
                </span>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  checked={consent.analytics}
                  onChange={() => handlePreferenceChange('analytics')}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="font-semibold text-gray-700">
                  Marketing Cookies
                </span>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  checked={consent.marketing}
                  onChange={() => handlePreferenceChange('marketing')}
                />
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
}
