// 'use client';

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// import {
//   ChevronRight,
//   GraduationCap,
//   Building2,
//   Users,
//   Upload,
// } from 'lucide-react';

// export default function BringZobsAI() {
//   const [tpoModal, setTpoModal] = useState(false);
//   const [staffModal, setStaffModal] = useState(false);
//   const [companyModal, setCompanyModal] = useState(false);

//   const [tpoData, setTpoData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     university: '',
//   });

//   const [companyData, setCompanyData] = useState({
//     role: '',
//     document: null as File | null,
//   });

//   const handleTpoChange = (e: any) => {
//     setTpoData({ ...tpoData, [e.target.name]: e.target.value });
//   };

//   const handleCompanyChange = (e: any) => {
//     setCompanyData({ ...companyData, [e.target.name]: e.target.value });
//   };

//   const handleCompanyDocUpload = (e: any) => {
//     setCompanyData({ ...companyData, document: e.target.files[0] });
//   };

//   const submitTpo = () => {
//     console.log('TPO:', tpoData);
//     setTpoModal(false);
//   };

//   const submitCompany = () => {
//     console.log('Company:', companyData);
//     setCompanyModal(false);
//   };

//   const whatsappMessage =
//     'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

//   return (
//     <div className="w-full min-h-screen bg-gray-50 flex justify-center p-6">
//       <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 space-y-10">
//         {/* TITLE */}
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold">Bring ZobsAI</h1>
//           <p className="text-gray-500">
//             Help your university or company access AI-powered recruitment.
//           </p>
//         </div>

//         {/* STUDENT SECTION */}
//         <Card className="border-l-4 border-blue-500 rounded-xl">
//           <CardContent className="p-6 space-y-3">
//             <div className="flex items-center gap-3">
//               <GraduationCap className="text-blue-600" size={26} />
//               <h2 className="text-xl font-semibold">I am a Student</h2>
//             </div>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               Submit your TPO contact and get 1 month Pro plan for FREE once
//               your university is onboarded.
//             </p>
//             <Button
//               className="w-full flex items-center gap-2"
//               onClick={() => setTpoModal(true)}
//             >
//               Share TPO Details <ChevronRight size={18} />
//             </Button>
//           </CardContent>
//         </Card>

//         {/* STAFF SECTION */}
//         <Card className="border-l-4 border-green-500 rounded-xl">
//           <CardContent className="p-6 space-y-3">
//             <div className="flex items-center gap-3">
//               <Users className="text-green-600" size={26} />
//               <h2 className="text-xl font-semibold">I am University Staff</h2>
//             </div>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               Get a ready message to send us on WhatsApp for university
//               onboarding.
//             </p>
//             <Button
//               className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
//               onClick={() => setStaffModal(true)}
//             >
//               WhatsApp Message <ChevronRight size={18} />
//             </Button>
//           </CardContent>
//         </Card>

//         {/* COMPANY SECTION */}
//         <Card className="border-l-4 border-purple-500 rounded-xl">
//           <CardContent className="p-6 space-y-3">
//             <div className="flex items-center gap-3">
//               <Building2 className="text-purple-600" size={26} />
//               <h2 className="text-xl font-semibold">
//                 Bring ZobsAI to My Company
//               </h2>
//             </div>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               Register your company, upload docs & get free job posting for 1
//               year.
//             </p>
//             <Button
//               className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
//               onClick={() => setCompanyModal(true)}
//             >
//               Register Company <ChevronRight size={18} />
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ================= TPO MODAL ================= */}
//       <Dialog open={tpoModal} onOpenChange={setTpoModal}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Submit TPO Details</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label>Name</Label>
//               <Input
//                 name="name"
//                 value={tpoData.name}
//                 onChange={handleTpoChange}
//               />
//             </div>
//             <div>
//               <Label>Email</Label>
//               <Input
//                 name="email"
//                 value={tpoData.email}
//                 onChange={handleTpoChange}
//               />
//             </div>
//             <div>
//               <Label>Phone</Label>
//               <Input
//                 name="phone"
//                 value={tpoData.phone}
//                 onChange={handleTpoChange}
//               />
//             </div>
//             <div>
//               <Label>University</Label>
//               <Input
//                 name="university"
//                 value={tpoData.university}
//                 onChange={handleTpoChange}
//               />
//             </div>
//             <Button className="w-full mt-2" onClick={submitTpo}>
//               Submit
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ================= UNIVERSITY STAFF MODAL ================= */}
//       <Dialog open={staffModal} onOpenChange={setStaffModal}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Send WhatsApp Message</DialogTitle>
//           </DialogHeader>

//           <p className="text-gray-600 text-sm">
//             Copy the message below and send it to us on WhatsApp:
//           </p>

//           <textarea
//             className="w-full border p-3 rounded-lg text-sm h-32"
//             readOnly
//             value={whatsappMessage}
//           />

//           <div className="flex gap-2">
//             <Button
//               className="flex-1"
//               onClick={() => navigator.clipboard.writeText(whatsappMessage)}
//             >
//               Copy Message
//             </Button>

//             <Button
//               className="flex-1 bg-green-600 hover:bg-green-700"
//               onClick={() =>
//                 window.open(
//                   `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
//                     whatsappMessage,
//                   )}`,
//                   '_blank',
//                 )
//               }
//             >
//               Open WhatsApp
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ================= COMPANY MODAL ================= */}
//       <Dialog open={companyModal} onOpenChange={setCompanyModal}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Company Registration</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <Label>Your Role</Label>
//               <Input
//                 placeholder="Director, HR Manager, Employee..."
//                 name="role"
//                 value={companyData.role}
//                 onChange={handleCompanyChange}
//               />
//             </div>

//             <div>
//               <Label>Upload Registration/GST/MSME Document</Label>
//               <div className="border p-3 rounded-lg flex items-center gap-3">
//                 <Upload />
//                 <Input type="file" onChange={handleCompanyDocUpload} />
//               </div>
//             </div>

//             <Button className="w-full" onClick={submitCompany}>
//               Register
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  GraduationCap,
  Building2,
  Users,
  Upload,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import Image from 'next/image';

export default function BringZobsAI() {
  const [tpoModal, setTpoModal] = useState(false);
  const [staffModal, setStaffModal] = useState(false);
  const [companyModal, setCompanyModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [tpoData, setTpoData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
  });
  const [companyData, setCompanyData] = useState({ role: '', document: null });

  const handleTpoChange = (e) =>
    setTpoData({ ...tpoData, [e.target.name]: e.target.value });
  const handleCompanyChange = (e) =>
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  const handleCompanyDocUpload = (e) =>
    setCompanyData({ ...companyData, document: e.target.files[0] });

  const submitTpo = () => {
    setSubmitted(true);
    setTimeout(() => {
      setTpoModal(false);
      setSubmitted(false);
    }, 1500);
  };

  const submitCompany = () => {
    setSubmitted(true);
    setTimeout(() => {
      setCompanyModal(false);
      setSubmitted(false);
    }, 1500);
  };

  const whatsappMessage =
    'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cards = [
    {
      id: 'student',
      title: 'I am a Student',
      description:
        'Submit your TPO contact and get 1 month Pro plan for FREE once your university is onboarded.',
      icon: GraduationCap,
      gradient: 'from-blue-600 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setTpoModal(true),
    },
    {
      id: 'staff',
      title: 'I am University Staff',
      description:
        'Get a ready message to send us on WhatsApp for university onboarding.',
      icon: Users,
      gradient: 'from-emerald-600 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => setStaffModal(true),
    },
    {
      id: 'company',
      title: 'Bring ZobsAI to My Company',
      description:
        'Register your company, upload docs & get free job posting for 1 year.',
      icon: Building2,
      gradient: 'from-violet-600 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      buttonColor: 'bg-violet-600 hover:bg-violet-700',
      onClick: () => setCompanyModal(true),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex justify-center p-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg shadow-lg ">
            <span className="text-lg font-bold text-white">ZA</span>
            <Image src="/logo.png" alt="ZobsAI Logo" width={32} height={32} />
          </div> */}
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text py-2 text-transparent">
            Bring ZobsAI
          </h1>
          <p className="text-gray-600 text-lg max-w-lg mx-auto">
            Transform your recruitment journey with AI-powered placement
            solutions
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative"
                style={{
                  animation: `slideUp 0.6s ease-out ${idx * 0.15}s backwards`,
                }}
              >
                {/* Gradient border effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                ></div>

                {/* Card */}
                <div
                  className={`relative h-full bg-gradient-to-br ${card.bgGradient} border border-gray-200/60 group-hover:border-gray-300 rounded-lg p-8 transition-all duration-500 group-hover:shadow-xl shadow-md`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Content */}
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    {card.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 min-h-12">
                    {card.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={card.onClick}
                    className={`w-full ${card.buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group/btn hover:shadow-lg active:scale-95`}
                  >
                    <span>Get Started</span>
                    <ChevronRight
                      className="group-hover/btn:translate-x-1 transition-transform duration-300"
                      size={20}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
          Questions? Reach out to us directly or explore our platform
        </div>
      </div>

      {/* ================= TPO MODAL ================= */}
      <Dialog open={tpoModal} onOpenChange={setTpoModal}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-gray-900">
              Submit TPO Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                Name
              </Label>
              <Input
                name="name"
                value={tpoData.name}
                onChange={handleTpoChange}
                placeholder="Your full name"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                Email
              </Label>
              <Input
                name="email"
                value={tpoData.email}
                onChange={handleTpoChange}
                placeholder="your@email.com"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                Phone
              </Label>
              <Input
                name="phone"
                value={tpoData.phone}
                onChange={handleTpoChange}
                placeholder="+91 XXXXXXXXXX"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                University
              </Label>
              <Input
                name="university"
                value={tpoData.university}
                onChange={handleTpoChange}
                placeholder="Your university name"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center gap-2 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={submitTpo}
            >
              {submitted ? (
                <>
                  <Check size={20} /> Submitted!
                </>
              ) : (
                <>
                  <Send size={20} /> Submit
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= UNIVERSITY STAFF MODAL ================= */}
      <Dialog open={staffModal} onOpenChange={setStaffModal}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-gray-900">
              Send WhatsApp Message
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-sm">
            Copy and send this message on WhatsApp to start the onboarding:
          </p>

          <textarea
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-lg text-sm h-28 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
            readOnly
            value={whatsappMessage}
          />

          <div className="flex gap-3">
            <button
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={18} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy
                </>
              )}
            </button>

            <button
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() =>
                window.open(
                  `https://wa.me/919661531033?text=${encodeURIComponent(
                    whatsappMessage,
                  )}`,
                  '_blank',
                )
              }
            >
              <Send size={18} /> WhatsApp
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= COMPANY MODAL ================= */}
      <Dialog open={companyModal} onOpenChange={setCompanyModal}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg text-gray-900">
              Company Registration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                Your Role
              </Label>
              <Input
                placeholder="Director, HR Manager, Employee..."
                name="role"
                value={companyData.role}
                onChange={handleCompanyChange}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block text-sm font-medium">
                Upload Registration/GST/MSME Document
              </Label>
              <div className="border-2 border-dashed border-gray-300 hover:border-violet-500 bg-gray-50 hover:bg-violet-50/30 p-6 rounded-lg flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <Upload className="text-violet-600" size={24} />
                </div>
                <Input
                  type="file"
                  onChange={handleCompanyDocUpload}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer text-center"
                >
                  <p className="text-sm text-gray-900 font-medium">
                    {companyData.document
                      ? companyData.document.name
                      : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, JPG (Max 10MB)
                  </p>
                </label>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center gap-2 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={submitCompany}
            >
              {submitted ? (
                <>
                  <Check size={20} /> Registered!
                </>
              ) : (
                <>
                  <Send size={20} /> Register
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
