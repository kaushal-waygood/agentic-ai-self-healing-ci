'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Infinity,
  Zap,
  Check,
  ShieldCheck,
  X,
  Mail,
  FileText,
  Upload,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
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
  const [isVerifying, setIsVerifying] = useState(false);

  const [data, setData] = useState<VerificationData>({
    method: 'email',
    email: '',
    idCard: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append('method', data.method);

      if (data.method === 'email') {
        formData.append('email', data.email);
      } else {
        if (!data.idCard) {
          throw new Error('ID card missing');
        }
        formData.append('idCard', data.idCard);
      }

      const verifyRes = await apiInstance.post(
        '/students/verify-student',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      if (verifyRes.status === 200) {
        await apiInstance.post('/students/activate-student-plan');
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          onClick={!isVerifying ? onClose : undefined}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl"
        >
          {!isVerifying && (
            <button onClick={onClose} className="absolute top-5 right-5">
              <X />
            </button>
          )}

          <div className="p-8">
            {isVerifying ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                <p className="font-bold">Verifying…</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <ShieldCheck className="mx-auto mb-3" />
                  <h3 className="text-xl font-black">Verify Student Status</h3>
                </div>

                <div className="flex bg-gray-100 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() =>
                      setData({ ...data, method: 'email', idCard: null })
                    }
                    className={`flex-1 py-3 font-bold ${
                      data.method === 'email'
                        ? 'bg-white shadow'
                        : 'text-gray-500'
                    }`}
                  >
                    <Mail className="inline mr-2" />
                    Email
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setData({ ...data, method: 'idCard', email: '' })
                    }
                    className={`flex-1 py-3 font-bold ${
                      data.method === 'idCard'
                        ? 'bg-white shadow'
                        : 'text-gray-500'
                    }`}
                  >
                    <FileText className="inline mr-2" />
                    ID Card
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {data.method === 'email' ? (
                    <input
                      type="email"
                      required
                      placeholder="you@university.edu"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      className="w-full border p-4 rounded-xl"
                    />
                  ) : (
                    <label className="block border-dashed border-2 rounded-xl p-6 text-center cursor-pointer">
                      <Upload className="mx-auto mb-2" />
                      <span className="font-bold">Upload ID Card</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        required
                        className="hidden"
                        onChange={(e) =>
                          setData({
                            ...data,
                            idCard: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 bg-black text-white font-black rounded-xl"
                  >
                    Submit Verification
                  </button>
                </form>
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
