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

export default function BringZobsAI() {
  const [activeCard, setActiveCard] = useState('student'); // Default active
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [tpoData, setTpoData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
  });

  const [companyData, setCompanyData] = useState({
    role: '',
    document: null as File | null,
    name: '',
    email: '',
    phone: '',
    university: '',
    company: '',
  });

  const whatsappMessage =
    'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTpoChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTpoData({ ...tpoData, [e.target.name]: e.target.value });

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });

  const handleCompanyDocUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCompanyData({
      ...companyData,
      document: e.target.files?.[0] ?? null,
    });

  const submitTpo = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1500);
  };

  const submitCompany = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1500);
  };

  const cards = [
    {
      id: 'student',
      title: 'I am a Student',
      description:
        'Submit your TPO (Training & Placement Officer) or Admin contact and get 1 month Pro plan for FREE once your university is onboarded.',
      icon: GraduationCap,
      gradient: 'from-blue-600 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      id: 'staff',
      title: 'I am University Staff',
      description:
        'Get a ready message to send us on WhatsApp for university onboarding.',
      icon: Users,
      gradient: 'from-emerald-600 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      id: 'company',
      title: 'Bring ZobsAI to My Company',
      description:
        'Register your company, upload docs & get free job posting for 1 year.',
      icon: Building2,
      gradient: 'from-violet-600 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
    },
  ];

  const renderDropdown = () => {
    if (!activeCard) return null;

    return (
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 ">
        {activeCard === 'student' && (
          <div className="space-y-6">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={tpoData.name}
                  onChange={handleTpoChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  value={tpoData.email}
                  onChange={handleTpoChange}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={tpoData.phone}
                  onChange={handleTpoChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label>University</Label>
                <Input
                  name="university"
                  value={tpoData.university}
                  onChange={handleTpoChange}
                  placeholder="Enter your university name"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              onClick={submitTpo}
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
        )}

        {/* STAFF */}
        {activeCard === 'staff' && (
          <div className="space-y-4">
            <textarea
              className="w-full bg-gray-50 border p-4 rounded-lg h-28 text-sm"
              readOnly
              value={whatsappMessage}
            />

            <button
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
              onClick={() =>
                window.open(
                  `https://wa.me/919661531033?text=${encodeURIComponent(
                    whatsappMessage,
                  )}`,
                  '_blank',
                )
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Send /> WhatsApp
            </button>
          </div>
        )}

        {/* COMPANY */}
        {activeCard === 'company' && (
          <div className="space-y-6">
            {/* ROLE + COMPANY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Your Role</Label>
                <Input
                  name="role"
                  value={companyData.role}
                  onChange={handleCompanyChange}
                  placeholder="e.g. HR Manager, Talent Lead"
                />
              </div>

              <div>
                <Label>Company Name</Label>
                <Input
                  name="company"
                  value={companyData.company}
                  onChange={handleCompanyChange}
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
                  onChange={handleCompanyChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label>Work Email</Label>
                <Input
                  name="email"
                  value={companyData.email}
                  onChange={handleCompanyChange}
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
                  onChange={handleCompanyChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label>University / College you want to reach out to</Label>
                <Input
                  name="university"
                  value={companyData.university}
                  onChange={handleCompanyChange}
                  placeholder="e.g. ABC University"
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
                  onChange={handleCompanyDocUpload}
                />
                <label htmlFor="doc-file" className="cursor-pointer block mt-2">
                  {companyData.document
                    ? companyData.document.name
                    : 'Upload document'}
                </label>
              </div>
            </div>

            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              onClick={submitCompany}
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
        )}
      </div>
    );
  };

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
      {/* RESPONSIVE + WIDER CARD ROW */}
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
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className={`
                w-full
                p-4
                rounded-lg
                cursor-pointer
                border
                bg-gradient-to-br ${card.bgGradient}
                transition-all duration-300
                ${isActive ? ' border-blue-400 scale-[1.04]' : ''}
              `}
            >
              {/* ICON + TITLE */}
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-lg bg-gradient-to-br ${card.gradient} text-white `}
                >
                  <Icon size={30} />
                </div>

                <h2 className="text-lg font-bold">{card.title}</h2>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
      {/* FULL-WIDTH DROPDOWN */}
      {renderDropdown()}
    </div>
  );
}
