'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Building2,
  Users,
  Upload,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiInstance from '@/services/api';

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

const COMPANY_ROLES = [
  'HR',
  'Talent Acquisition',
  'Director',
  'CEO',
  'Founder',
  'CTO',
  'Hiring Manager',
  'Recruiter',
  'Department Head',
];

const CARDS = [
  {
    id: 'student' as ActiveCard,
    title: 'I am a Student',
    description:
      'Submit your TPO (Training & Placement Officer) or Admin contact and get 1 month Pro plan for FREE once your university is onboarded.',
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
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    id: 'company' as ActiveCard,
    title: 'Bring ZobsAI to My Company',
    description:
      'Register your company, upload docs & get free job posting for 1 year.',
    icon: Building2,
    gradient: 'from-violet-600 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
  },
];

const WHATSAPP_MESSAGE =
  'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text py-1 text-transparent">
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

/* ---------------- STUDENT FORM ---------------- */

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
        name: tpoData.name,
        email: tpoData.email,
        phone: tpoData.phone,
      };

      const res = await apiInstance.post('/user/bring-zobs/student', payload);

      console.log('Student bring response:', res.data);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1500);
    } catch (err: any) {
      console.error('Student submit error:', err?.response?.data || err);
    }
  };
  return (
    <div className="space-y-6">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>University</Label>
          <Input
            name="university"
            value={tpoData.university}
            onChange={handleChange}
            placeholder="Enter your university name"
          />
        </div>
        <div>
          <Label>TPO Name</Label>
          <Input
            name="name"
            value={tpoData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>TPO Phone</Label>
          <Input
            name="phone"
            value={tpoData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <Label>TPO Email</Label>
          <Input
            name="email"
            value={tpoData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
        </div>
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
    </div>
  );
}

/* ---------------- STAFF SECTION ---------------- */

function StaffSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WHATSAPP_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/919661531033?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
      '_blank',
    );
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full bg-gray-50 border p-4 rounded-lg h-28 text-sm"
        readOnly
        value={WHATSAPP_MESSAGE}
      />

      <button
        type="button"
        onClick={handleCopy}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check /> Copied!
          </>
        ) : (
          <>
            <Copy /> Copy
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleWhatsApp}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
      >
        <Send /> WhatsApp
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCompanyData((prev) => ({ ...prev, document: file }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append('role', companyData.role || '');
      formData.append('company', companyData.company || '');
      formData.append('name', companyData.name || '');
      formData.append('email', companyData.email || '');
      formData.append('phone', companyData.phone || '');
      formData.append('university', companyData.university || '');

      if (companyData.document) {
        // IMPORTANT: must match fieldname expected by multer: "attachment"
        formData.append('attachment', companyData.document);
      }

      const res = await apiInstance.post('/user/bring-zobs/company', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Company bring response:', res.data);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1500);
    } catch (err: any) {
      console.error('Company submit error:', err?.response?.data || err);
    }
  };

  const isPresetRole = companyData.role
    ? COMPANY_ROLES.includes(companyData.role)
    : false;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Your Role</Label>
          <Select
            value={
              !companyData.role ? '' : isPresetRole ? companyData.role : 'OTHER'
            }
            onValueChange={(value) => {
              if (value === 'OTHER') {
                setCompanyData((prev) => ({
                  ...prev,
                  role: '',
                }));
              } else {
                setCompanyData((prev) => ({
                  ...prev,
                  role: value,
                }));
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="z-[999] bg-white">
              {COMPANY_ROLES.map((role) => (
                <SelectItem key={role} value={role} className="z-[999]">
                  {role}
                </SelectItem>
              ))}
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          {(!companyData.role || !isPresetRole) && (
            <div className="mt-2">
              <Input
                name="role"
                value={companyData.role || ''}
                onChange={handleChange}
                placeholder="Enter your role"
              />
            </div>
          )}
        </div>

        <div>
          <Label>Company Name</Label>
          <Input
            name="company"
            value={companyData.company}
            onChange={handleChange}
            placeholder="Enter your company name"
          />
        </div>
      </div>

      {/* CONTACT PERSON DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Your Name</Label>
          <Input
            name="name"
            value={companyData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <Label>Work Email</Label>
          <Input
            name="email"
            value={companyData.email}
            onChange={handleChange}
            placeholder="Enter your work email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Work Phone</Label>
          <Input
            name="phone"
            value={companyData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      {/* DOC UPLOAD */}
      <div>
        <Label>Upload Registration/GST/MSME Document</Label>
        <div className="border-2 border-dashed p-6 rounded-lg text-center">
          <Upload className="mx-auto text-violet-600" />
          <input
            type="file"
            className="hidden"
            id="doc-file"
            onChange={handleDocUpload}
          />
          <label htmlFor="doc-file" className="cursor-pointer block mt-2">
            {companyData.document
              ? companyData.document.name
              : 'Upload document'}
          </label>
        </div>
      </div>

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
            <Send /> Register
          </>
        )}
      </button>
    </div>
  );
}
