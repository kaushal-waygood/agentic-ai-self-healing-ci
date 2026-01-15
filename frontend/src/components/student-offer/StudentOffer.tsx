'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Infinity,
  Zap,
  Star,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  X,
  Mail,
  FileText,
  Upload,
  CheckCircle,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCheckoutRequest } from '@/redux/actions/checkoutAction'; // Ensure this path is correct
import HeroSection from './HeroSection';
import apiInstance from '@/services/api';

// --- VERIFICATION MODAL COMPONENT ---
const VerificationModal = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}) => {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'id'>('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const [data, setData] = useState({
    method,
    email: '',
    id: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    console.log(data);

    const response = await apiInstance.post('/students/verify-student', data);

    console.log(response);

    if (response.status === 200) {
      const response = await apiInstance.post(
        '/students/activate-student-plan',
      );
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isVerifying ? onClose : undefined}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {!isVerifying && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          )}

          <div className="p-8 md:p-10">
            {isVerifying ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
                  <Loader2 className="w-20 h-20 text-indigo-600 animate-spin absolute top-0" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Verifying Status...
                </h3>
                <p className="text-gray-500">
                  Please wait while we validate your credentials.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {user ? 'Verify Student Status' : 'Join zobsAI First'}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    {user
                      ? 'Unlock your 12 months free offer.'
                      : 'Create an account to claim this offer.'}
                  </p>
                </div>

                {!user ? (
                  <div className="space-y-4">
                    <Link href="/signup" className="w-full block">
                      <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2">
                        <UserPlus className="w-5 h-5" /> Create Student Account
                      </button>
                    </Link>
                    <Link href="/login" className="w-full block">
                      <button className="w-full py-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-100 flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" /> Login
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                      <button
                        onClick={() => setMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                          method === 'email'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500'
                        }`}
                      >
                        <Mail className="w-4 h-4" /> Email
                      </button>
                      <button
                        onClick={() => setMethod('id')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                          method === 'id'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500'
                        }`}
                      >
                        <FileText className="w-4 h-4" /> ID Card
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {method === 'email' ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            University Email
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="you@university.edu"
                            onChange={(e) =>
                              setData({ ...data, email: e.target.value })
                            }
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Upload ID Photo
                          </label>
                          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-indigo-50 transition-all cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-600">
                              Click to upload ID Card
                            </p>
                            <input
                              type="file"
                              required
                              onChange={(e) =>
                                setData({ ...data, id: e.target.files?.[0] })
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      )}
                      <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all">
                        Submit Verification
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function StudentOfferPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  const unlimitedFeatures = ['Job Search', 'Job Matching', 'Job Application'];
  const monthlyFeatures = [
    { title: 'AI CV Creation', count: 5 },
    { title: 'AI Cover Letter', count: 5 },
    { title: 'AI Tailored Application', count: 5 },
    { title: 'AI Auto Application', count: 10 },
    { title: 'Auto-Apply Daily limit', count: 5 },
    { title: 'AI Job Match Score', count: 5 },
    { title: 'AI ATS Score', count: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#FBFDFF] relative overflow-hidden font-sans">
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
      {/* hero section */}
      <HeroSection />

      {/* offer details */}
      <div id="offer-details" className=" max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-full text-yellow-800 text-xs font-black tracking-widest mb-6">
              <Sparkles className="w-4 h-4" /> EXCLUSIVE STUDENT DEAL
            </div> */}
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-[0.95] mb-8">
              Start for <br />
              <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
                Free.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Unlock 12 months of Pro access to land your dream job. No credit
              card, no catch.
            </p>

            {/* <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-indigo-50">
              <div className="flex justify-between items-end mb-4 text-sm font-bold">
                <span className="text-gray-500 uppercase tracking-widest">
                  Seats Remaining
                </span>
                <span className="text-indigo-600 text-2xl font-black">
                  432 / 1,000
                </span>
              </div>
              <div className="h-4 bg-indigo-50 rounded-full overflow-hidden p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '43.2%' }}
                  transition={{ duration: 1 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div> */}
          </div>

          {/* Right Column: Plan Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-header-gradient-primary p-5 text-white">
                <h3 className="text-3xl md:text-xl font-black ">
                  Student Plan
                </h3>
                <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-sm italic">
                  12 Months Free Access
                </p>
              </div>

              <div className="p-6 md:p-4">
                <div className="grid md:grid-cols-2 gap-10 md:gap-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-black text-gray-900 mb-6 text-sm tracking-widest uppercase">
                      <Infinity className="w-5 h-5 text-indigo-500" /> Unlimited
                    </h4>
                    <ul className="space-y-4  text-gray-700 font-semibold">
                      {unlimitedFeatures.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-500 stroke-[3px]" />{' '}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-black text-gray-900 mb-6 text-sm tracking-widest uppercase">
                      <Zap className="w-5 h-5 text-purple-500" /> Per Month
                    </h4>
                    <ul className="space-y-3">
                      {monthlyFeatures.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-600"
                        >
                          <span>{item.title}</span>
                          <span className="text-indigo-600 font-black">
                            {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-lg font-black text-xl md:text-lg hover:bg-blue-800 transition-all shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-1"
                >
                  Claim My 12 Months Free
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
