'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Building2,
  Users,
  Check,
  Send,
  Phone,
  Mail,
} from 'lucide-react';

import apiInstance from '@/services/api';
import { toast } from '@/hooks/use-toast';

type ActiveCard = 'student' | 'staff' | 'company';

interface TpoData {
  name: string;
  email: string;
  phone: string;
  university: string;
}

interface CompanyData {
  role: string;
  document: File | null;
  name: string;
  email: string;
  phone: string;
  university: string;
  company: string;
}

const CARDS = [
  {
    id: 'student' as ActiveCard,
    title: 'I am User',
    description:
      'I want to request a free job posting for my university/company for other users.',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    id: 'staff' as ActiveCard,
    title: 'I am University Staff',
    description:
      'Get a ready message to send us on WhatsApp for university onboarding.',
    icon: Users,
    gradient: 'from-emerald-600 to-teal-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    id: 'company' as ActiveCard,
    title: 'Bring ZobsAI to My Company',
    description:
      'Register your company, upload docs & get free job posting for 1 year.',
    icon: Building2,
    gradient: 'from-violet-600 to-purple-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
];

export default function BringZobsAI() {
  const [activeCard, setActiveCard] = useState<ActiveCard>('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const requestConfirmation = (action: () => void) => {
    setPendingAction(() => action);
    setIsModalOpen(true);
  };
  const [tpoData, setTpoData] = useState<TpoData>({
    name: '',
    email: '',
    phone: '',
    university: '',
  });

  const [companyData, setCompanyData] = useState<CompanyData>({
    role: '',
    document: null,
    name: '',
    email: '',
    phone: '',
    university: '',
    company: '',
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
          Bring ZobsAI
        </h1>
        <p className="text-gray-600 text-lg max-w-lg mx-auto">
          Transform your recruitment journey with AI-powered placement solutions
        </p>
      </div>

      {/* CARDS */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-8
          w-full
          px-2 sm:px-4
        "
      >
        {CARDS.map((card) => {
          const Icon = card.icon;
          const isActive = activeCard === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveCard(card.id)}
              className={`
                w-full
                p-4
                rounded-lg
                text-left
                border-2
                bg-gradient-to-br ${card.bgGradient}
                transition-all duration-300
                ${
                  isActive
                    ? 'border-blue-400 scale-[1.04]'
                    : 'border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}
                >
                  <Icon size={30} />
                </div>
                <h2 className="text-lg font-bold">{card.title}</h2>
              </div>

              <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* FORM CONTENT */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        {activeCard === 'student' && (
          <StudentForm
            tpoData={tpoData}
            setTpoData={setTpoData}
            onConfirmSubmit={requestConfirmation}
          />
        )}

        {activeCard === 'staff' && (
          <StaffSection onConfirmSubmit={requestConfirmation} />
        )}

        {activeCard === 'company' && (
          <CompanyForm
            companyData={companyData}
            setCompanyData={setCompanyData}
            onConfirmSubmit={requestConfirmation}
          />
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => pendingAction?.()}
      />
    </div>
  );
}

interface StudentFormProps {
  tpoData: TpoData;
  setTpoData: React.Dispatch<React.SetStateAction<TpoData>>;
  onConfirmSubmit: (action: () => void) => void;
}

function StudentForm({
  tpoData,
  setTpoData,
  onConfirmSubmit,
}: StudentFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    university: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateAndConfirm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    const newErrors = {
      university: !tpoData.university.trim()
        ? 'University/Company name is required'
        : '',
      email: !tpoData.email.trim()
        ? 'Email is required'
        : !emailRegex.test(tpoData.email)
          ? 'Please enter a valid email address'
          : '',
      phone: !tpoData.phone.trim()
        ? 'Phone number is required'
        : !phoneRegex.test(tpoData.phone)
          ? 'Please enter a valid 10-digit phone number'
          : '',
    };

    setErrors(newErrors);

    // If any errors exist, don't proceed
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    onConfirmSubmit(handleSubmit);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        university: tpoData.university,
        email: tpoData.email,
        phone: tpoData.phone,
      };

      const res = await apiInstance.post('/bring-zobs/student', payload);

      if (res.status === 200 || res.status === 201) {
        toast({
          title: 'Success!',
          description: 'Your request has been submitted successfully.',
          variant: 'success',
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err: any) {
      console.error('Student submit error:', err?.response?.data || err);
      toast({
        title: 'Submission Failed',
        description:
          err?.response?.data?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* University/Company Name */}
        <div className="space-y-2 group">
          <Label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
            University/Company Name
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
            <Input
              name="university"
              value={tpoData.university}
              onChange={handleChange}
              placeholder="Enter university/company name"
              className={`pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.university ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
          </div>
          {errors.university && (
            <p className="text-sm text-red-500 mt-1">{errors.university}</p>
          )}
        </div>

        {/* TPO Phone */}
        <div className="space-y-2 group">
          <Label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
            TPO Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
            <Input
              name="phone"
              type="tel"
              value={tpoData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={`pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* TPO Email */}
        <div className="space-y-2 group md:col-span-2">
          <Label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
            TPO Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
            <Input
              name="email"
              type="email"
              value={tpoData.email}
              onChange={handleChange}
              placeholder="example@university.edu"
              className={`pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          disabled={submitted}
          onClick={validateAndConfirm}
          className={`
            w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-semibold text-white
            transition-all duration-300 transform active:scale-[0.98]
            ${
              submitted
                ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-200 hover:-translate-y-0.5'
            }
            disabled:cursor-not-allowed
          `}
        >
          {submitted ? (
            <>
              <div className="bg-white/20 p-1 rounded-full">
                <Check className="size-4 text-white" />
              </div>
              <span className="tracking-wide">Request Submitted!</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span className="tracking-wide">Send Request</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          By clicking submit, you agree to our terms for institutional
          onboarding.
        </p>
      </div>
    </div>
  );
}

function StaffSection({
  onConfirmSubmit,
}: {
  onConfirmSubmit: (action: () => void) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiInstance.post('/user/onboard/initiate', {
        type: 'university',
      });

      if (res.status === 200) {
        toast({
          title: 'Registration Link Sent',
          description: 'Please check your email for the registration link.',
          variant: 'success',
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err: any) {
      console.error('Staff submit error:', err?.response?.data || err);
      toast({
        title: 'Submission Failed',
        description:
          err?.response?.data?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <button
        type="button"
        disabled={isSubmitting || submitted}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onConfirmSubmit(handleSubmit)}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : submitted ? (
          <>
            <Check className="size-4" /> Registered!
          </>
        ) : (
          <>
            <Send className="size-4" /> I Want to Register as Organisation for
            posting jobs
          </>
        )}
      </button>
    </div>
  );
}

interface CompanyFormProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  onConfirmSubmit: (action: () => void) => void;
}

function CompanyForm({
  companyData,
  setCompanyData,
  onConfirmSubmit,
}: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiInstance.post('/user/onboard/initiate', {
        type: 'company',
      });

      if (res.status === 200) {
        toast({
          title: 'Registered!',
          description: 'Your company has been registered successfully.',
          variant: 'success',
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err: any) {
      console.error('Company submit error:', err?.response?.data || err);
      toast({
        title: 'Registration Failed',
        description:
          err?.response?.data?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <button
        type="button"
        disabled={isSubmitting || submitted}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onConfirmSubmit(handleSubmit)}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : submitted ? (
          <>
            <Check className="size-4" /> Registered!
          </>
        ) : (
          <>
            <Send className="size-4" /> I Want to Register as Organisation for
            posting jobs
          </>
        )}
      </button>
    </div>
  );
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
        <p className="text-gray-600 mt-2">
          By proceeding, you will no longer be a normal user. This action will
          initiate your organization onboarding.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
