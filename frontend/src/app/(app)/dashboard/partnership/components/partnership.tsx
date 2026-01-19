'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Building2, Users, Check, Send } from 'lucide-react';

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
                border
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
          <StudentForm tpoData={tpoData} setTpoData={setTpoData} />
        )}

        {activeCard === 'staff' && <StaffSection />}

        {activeCard === 'company' && (
          <CompanyForm
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        )}
      </div>
    </div>
  );
}

interface StudentFormProps {
  tpoData: TpoData;
  setTpoData: React.Dispatch<React.SetStateAction<TpoData>>;
}

function StudentForm({ tpoData, setTpoData }: StudentFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        university: tpoData.university,
        email: tpoData.email,
        phone: tpoData.phone,
      };

      const res = await apiInstance.post('/bring-zobs/student', payload);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1500);
    } catch (err: any) {
      console.error('Student submit error:', err?.response?.data || err);
    }
  };

  const ROLES = ['employer-admin', 'uni-admin'];
  return (
    <div className="space-y-6">
      {/* ROW 1 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="">
          <Label className="">University/Company Name</Label>
          <Input
            name="university"
            value={tpoData.university}
            onChange={handleChange}
            placeholder="Enter university/company name"
          />
        </div>
        <div>
          <Label>TPO Phone</Label>
          <Input
            name="phone"
            value={tpoData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>TPO Email</Label>
          <Input
            name="email"
            value={tpoData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>
        {/* SUBMIT BUTTON */}
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          onClick={handleSubmit}
        >
          {submitted ? (
            <>
              <Check /> Submitted!
            </>
          ) : (
            <>
              <Send /> Submit
            </>
          )}
        </button>
        <div></div>
      </div>
    </div>
  );
}

function StaffSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const res = await apiInstance.post('/user/onboard/initiate', {
        type: 'university',
      });

      setSubmitted(true);

      if (res.status === 200) {
        toast({
          title: 'Registration Link Sent',
          description: 'Please check your email for the registration link.',
        });
      }
    } catch (err: any) {
      console.error('Company submit error:', err?.response?.data || err);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        onClick={handleSubmit}
      >
        {submitted ? (
          <>
            <Check /> Registered!
          </>
        ) : (
          <>
            <Send /> I Want to Register as Organisation for posting jobs
          </>
        )}
      </button>
    </div>
  );
}

interface CompanyFormProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
}

function CompanyForm({ companyData, setCompanyData }: CompanyFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const res = await apiInstance.post('/user/onboard/initiate', {
        type: 'company',
      });

      setSubmitted(true);

      if (res.status === 200) {
        toast({
          title: 'Registered!',
          description: 'Your company has been registered successfully.',
          variant: 'success',
        });
      }
    } catch (err: any) {
      console.error('Company submit error:', err?.response?.data || err);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        onClick={handleSubmit}
      >
        {submitted ? (
          <>
            <Check /> Registered!
          </>
        ) : (
          <>
            <Send /> I Want to Register as Organisation for posting jobs
          </>
        )}
      </button>
    </div>
  );
}
