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
//       <div className="max-w-3xl w-full bg-white rounded-lg  p-8 space-y-10">
//         {/* TITLE */}
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold">Bring ZobsAI</h1>
//           <p className="text-gray-500">
//             Help your university or company access AI-powered recruitment.
//           </p>
//         </div>

//         {/* STUDENT SECTION */}
//         <Card className="border-l-4 border-blue-500 rounded-lg">
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
//         <Card className="border-l-4 border-green-500 rounded-lg">
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
//         <Card className="border-l-4 border-purple-500 rounded-lg">
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

// 'use client';

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
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
//   Copy,
//   Check,
//   Send,
// } from 'lucide-react';
// import Image from 'next/image';

// export default function BringZobsAI() {
//   const [tpoModal, setTpoModal] = useState(false);
//   const [staffModal, setStaffModal] = useState(false);
//   const [companyModal, setCompanyModal] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const [tpoData, setTpoData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     university: '',
//   });
//   const [companyData, setCompanyData] = useState({ role: '', document: null });

//   const handleTpoChange = (e) =>
//     setTpoData({ ...tpoData, [e.target.name]: e.target.value });
//   const handleCompanyChange = (e) =>
//     setCompanyData({ ...companyData, [e.target.name]: e.target.value });
//   const handleCompanyDocUpload = (e) =>
//     setCompanyData({ ...companyData, document: e.target.files[0] });

//   const submitTpo = () => {
//     setSubmitted(true);
//     setTimeout(() => {
//       setTpoModal(false);
//       setSubmitted(false);
//     }, 1500);
//   };

//   const submitCompany = () => {
//     setSubmitted(true);
//     setTimeout(() => {
//       setCompanyModal(false);
//       setSubmitted(false);
//     }, 1500);
//   };

//   const whatsappMessage =
//     'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

//   const handleCopy = () => {
//     navigator.clipboard.writeText(whatsappMessage);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const cards = [
//     {
//       id: 'student',
//       title: 'I am a Student',
//       description:
//         'Submit your TPO contact and get 1 month Pro plan for FREE once your university is onboarded.',
//       icon: GraduationCap,
//       gradient: 'from-blue-600 to-cyan-500',
//       bgGradient: 'from-blue-50 to-cyan-50',
//       buttonColor: 'bg-blue-600 hover:bg-blue-700',
//       onClick: () => setTpoModal(true),
//     },
//     {
//       id: 'staff',
//       title: 'I am University Staff',
//       description:
//         'Get a ready message to send us on WhatsApp for university onboarding.',
//       icon: Users,
//       gradient: 'from-emerald-600 to-teal-500',
//       bgGradient: 'from-emerald-50 to-teal-50',
//       buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
//       onClick: () => setStaffModal(true),
//     },
//     {
//       id: 'company',
//       title: 'Bring ZobsAI to My Company',
//       description:
//         'Register your company, upload docs & get free job posting for 1 year.',
//       icon: Building2,
//       gradient: 'from-violet-600 to-purple-500',
//       bgGradient: 'from-violet-50 to-purple-50',
//       buttonColor: 'bg-violet-600 hover:bg-violet-700',
//       onClick: () => setCompanyModal(true),
//     },
//   ];

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex justify-center p-6 overflow-hidden">
//       {/* Animated background elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
//           style={{ animationDelay: '1s' }}
//         ></div>
//       </div>

//       <div className="max-w-4xl w-full relative z-10">
//         {/* Header */}
//         <div className="text-center space-y-4 mb-16">
//           <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text py-2 text-transparent">
//             Bring ZobsAI
//           </h1>
//           <p className="text-gray-600 text-lg max-w-lg mx-auto">
//             Transform your recruitment journey with AI-powered placement
//             solutions
//           </p>
//         </div>

//         {/* Cards Grid */}
//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           {cards.map((card, idx) => {
//             const Icon = card.icon;
//             return (
//               <div
//                 key={card.id}
//                 className="group relative"
//                 style={{
//                   animation: `slideUp 0.6s ease-out ${idx * 0.15}s backwards`,
//                 }}
//               >
//                 {/* Gradient border effect */}
//                 <div
//                   className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
//                 ></div>

//                 {/* Card */}
//                 <div
//                   className={`relative h-full bg-gradient-to-br ${card.bgGradient} border border-gray-200/60 group-hover:border-gray-300 rounded-lg p-8 transition-all duration-500 group- `}
//                 >
//                   {/* Icon */}
//                   <div
//                     className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.gradient} mb-5 group-hover:scale-110 transition-transform duration-300 `}
//                   >
//                     <Icon className="text-white" size={28} />
//                   </div>

//                   {/* Content */}
//                   <h2 className="text-lg font-bold text-gray-900 mb-3">
//                     {card.title}
//                   </h2>
//                   <p className="text-gray-600 text-sm leading-relaxed mb-8 min-h-12">
//                     {card.description}
//                   </p>

//                   {/* Button */}
//                   <button
//                     onClick={card.onClick}
//                     className={`w-full ${card.buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-between group/btn  active:scale-95`}
//                   >
//                     <span>Get Started</span>
//                     <ChevronRight
//                       className="group-hover/btn:translate-x-1 transition-transform duration-300"
//                       size={20}
//                     />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Bottom CTA */}
//         <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
//           Questions? Reach out to us directly or explore our platform
//         </div>
//       </div>

//       {/* ================= TPO MODAL ================= */}
//       <Dialog open={tpoModal} onOpenChange={setTpoModal}>
//         <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
//           <DialogHeader>
//             <DialogTitle className="text-lg text-gray-900">
//               Submit TPO Details
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-5">
//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 Name
//               </Label>
//               <Input
//                 name="name"
//                 value={tpoData.name}
//                 onChange={handleTpoChange}
//                 placeholder="Your full name"
//                 className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
//               />
//             </div>
//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 Email
//               </Label>
//               <Input
//                 name="email"
//                 value={tpoData.email}
//                 onChange={handleTpoChange}
//                 placeholder="your@email.com"
//                 className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
//               />
//             </div>
//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 Phone
//               </Label>
//               <Input
//                 name="phone"
//                 value={tpoData.phone}
//                 onChange={handleTpoChange}
//                 placeholder="+91 XXXXXXXXXX"
//                 className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
//               />
//             </div>
//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 University
//               </Label>
//               <Input
//                 name="university"
//                 value={tpoData.university}
//                 onChange={handleTpoChange}
//                 placeholder="Your university name"
//                 className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
//               />
//             </div>
//             <button
//               className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center gap-2 active:scale-95  "
//               onClick={submitTpo}
//             >
//               {submitted ? (
//                 <>
//                   <Check size={20} /> Submitted!
//                 </>
//               ) : (
//                 <>
//                   <Send size={20} /> Submit
//                 </>
//               )}
//             </button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ================= UNIVERSITY STAFF MODAL ================= */}
//       <Dialog open={staffModal} onOpenChange={setStaffModal}>
//         <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
//           <DialogHeader>
//             <DialogTitle className="text-lg text-gray-900">
//               Send WhatsApp Message
//             </DialogTitle>
//           </DialogHeader>

//           <p className="text-gray-600 text-sm">
//             Copy and send this message on WhatsApp to start the onboarding:
//           </p>

//           <textarea
//             className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-lg text-sm h-28 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
//             readOnly
//             value={whatsappMessage}
//           />

//           <div className="flex gap-3">
//             <button
//               className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
//               onClick={handleCopy}
//             >
//               {copied ? (
//                 <>
//                   <Check size={18} /> Copied!
//                 </>
//               ) : (
//                 <>
//                   <Copy size={18} /> Copy
//                 </>
//               )}
//             </button>

//             <button
//               className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95  "
//               onClick={() =>
//                 window.open(
//                   `https://wa.me/919661531033?text=${encodeURIComponent(
//                     whatsappMessage,
//                   )}`,
//                   '_blank',
//                 )
//               }
//             >
//               <Send size={18} /> WhatsApp
//             </button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ================= COMPANY MODAL ================= */}
//       <Dialog open={companyModal} onOpenChange={setCompanyModal}>
//         <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-lg">
//           <DialogHeader>
//             <DialogTitle className="text-lg text-gray-900">
//               Company Registration
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-5">
//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 Your Role
//               </Label>
//               <Input
//                 placeholder="Director, HR Manager, Employee..."
//                 name="role"
//                 value={companyData.role}
//                 onChange={handleCompanyChange}
//                 className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg"
//               />
//             </div>

//             <div>
//               <Label className="text-gray-700 mb-2 block text-sm font-medium">
//                 Upload Registration/GST/MSME Document
//               </Label>
//               <div className="border-2 border-dashed border-gray-300 hover:border-violet-500 bg-gray-50 hover:bg-violet-50/30 p-6 rounded-lg flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer">
//                 <div className="p-3 bg-violet-100 rounded-lg">
//                   <Upload className="text-violet-600" size={24} />
//                 </div>
//                 <Input
//                   type="file"
//                   onChange={handleCompanyDocUpload}
//                   className="hidden"
//                   id="file-input"
//                 />
//                 <label
//                   htmlFor="file-input"
//                   className="cursor-pointer text-center"
//                 >
//                   <p className="text-sm text-gray-900 font-medium">
//                     {companyData.document
//                       ? companyData.document.name
//                       : 'Click to upload or drag & drop'}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     PDF, DOC, JPG (Max 10MB)
//                   </p>
//                 </label>
//               </div>
//             </div>

//             <button
//               className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center gap-2 active:scale-95  "
//               onClick={submitCompany}
//             >
//               {submitted ? (
//                 <>
//                   <Check size={20} /> Registered!
//                 </>
//               ) : (
//                 <>
//                   <Send size={20} /> Register
//                 </>
//               )}
//             </button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <style>{`
//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// 'use client';

// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   ChevronRight,
//   GraduationCap,
//   Building2,
//   Users,
//   Copy,
//   Check,
//   Upload,
//   Send,
// } from 'lucide-react';

// export default function BringZobsAI() {
//   const [openCard, setOpenCard] = useState(null);
//   const [copied, setCopied] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const [tpoData, setTpoData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     university: '',
//   });

//   const [companyData, setCompanyData] = useState({
//     role: '',
//     document: null,
//   });

//   const whatsappMessage =
//     'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

//   const handleCopy = () => {
//     navigator.clipboard.writeText(whatsappMessage);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const toggleCard = (id) => {
//     setOpenCard((prev) => (prev === id ? null : id));
//   };

//   const cards = [
//     {
//       id: 'student',
//       title: 'I am a Student',
//       icon: GraduationCap,
//       gradient: 'from-blue-600 to-cyan-500',
//       bgGradient: 'from-blue-50 to-cyan-50',
//       content: (
//         <div className="space-y-4 pt-4">
//           <Label>Name</Label>
//           <Input
//             name="name"
//             value={tpoData.name}
//             onChange={(e) => setTpoData({ ...tpoData, name: e.target.value })}
//             placeholder="Your name"
//           />

//           <Label>Email</Label>
//           <Input
//             name="email"
//             value={tpoData.email}
//             onChange={(e) => setTpoData({ ...tpoData, email: e.target.value })}
//             placeholder="you@email.com"
//           />

//           <Label>Phone</Label>
//           <Input
//             name="phone"
//             value={tpoData.phone}
//             onChange={(e) => setTpoData({ ...tpoData, phone: e.target.value })}
//             placeholder="+91 XXXXXXXXXX"
//           />

//           <Label>University</Label>
//           <Input
//             name="university"
//             value={tpoData.university}
//             onChange={(e) =>
//               setTpoData({ ...tpoData, university: e.target.value })
//             }
//             placeholder="Your university"
//           />

//           <button
//             onClick={() => {
//               setSubmitted(true);
//               setTimeout(() => setSubmitted(false), 1800);
//             }}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
//           >
//             {submitted ? (
//               <>
//                 <Check /> Submitted
//               </>
//             ) : (
//               <>
//                 <Send /> Submit
//               </>
//             )}
//           </button>
//         </div>
//       ),
//     },

//     {
//       id: 'staff',
//       title: 'I am University Staff',
//       icon: Users,
//       gradient: 'from-emerald-600 to-teal-500',
//       bgGradient: 'from-emerald-50 to-teal-50',
//       content: (
//         <div className="space-y-4 pt-4">
//           <textarea
//             className="w-full p-4 bg-gray-50 border rounded-lg h-28 text-sm"
//             readOnly
//             value={whatsappMessage}
//           />

//           <button
//             onClick={handleCopy}
//             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
//           >
//             {copied ? (
//               <>
//                 <Check /> Copied
//               </>
//             ) : (
//               <>
//                 <Copy /> Copy Message
//               </>
//             )}
//           </button>

//           <button
//             className="w-full bg-black text-white py-3 rounded-lg font-semibold"
//             onClick={() =>
//               window.open(
//                 `https://wa.me/919661531033?text=${encodeURIComponent(
//                   whatsappMessage,
//                 )}`,
//                 '_blank',
//               )
//             }
//           >
//             Send on WhatsApp
//           </button>
//         </div>
//       ),
//     },

//     {
//       id: 'company',
//       title: 'Bring ZobsAI to My Company',
//       icon: Building2,
//       gradient: 'from-violet-600 to-purple-500',
//       bgGradient: 'from-violet-50 to-purple-50',
//       content: (
//         <div className="space-y-4 pt-4">
//           <Label>Your Role</Label>
//           <Input
//             placeholder="Director, HR Manager..."
//             value={companyData.role}
//             onChange={(e) =>
//               setCompanyData({ ...companyData, role: e.target.value })
//             }
//           />

//           <Label>Upload Company Document</Label>
//           <div className="border-dashed border-2 p-6 rounded-lg text-center cursor-pointer">
//             <Upload className="mx-auto mb-2" />
//             <input
//               type="file"
//               onChange={(e) =>
//                 setCompanyData({
//                   ...companyData,
//                   document: e.target.files[0],
//                 })
//               }
//               className="hidden"
//               id="doc-upload"
//             />
//             <label htmlFor="doc-upload" className="cursor-pointer">
//               {companyData.document
//                 ? companyData.document.name
//                 : 'Click to upload document'}
//             </label>
//           </div>

//           <button
//             onClick={() => {
//               setSubmitted(true);
//               setTimeout(() => setSubmitted(false), 1500);
//             }}
//             className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
//           >
//             {submitted ? (
//               <>
//                 <Check /> Registered
//               </>
//             ) : (
//               <>
//                 <Send /> Register
//               </>
//             )}
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-6 flex justify-center">
//       <div className="max-w-xl w-full space-y-6">
//         <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//           Bring ZobsAI
//         </h1>

//         {/* COLUMN VIEW */}
//         {cards.map((card) => {
//           const Icon = card.icon;
//           return (
//             <div
//               key={card.id}
//               className={`bg-gradient-to-br ${card.bgGradient} border p-6 rounded-lg `}
//             >
//               {/* CARD HEADER */}
//               <div
//                 className="flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleCard(card.id)}
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`p-3 rounded-lg bg-gradient-to-r ${card.gradient}`}
//                   >
//                     <Icon className="text-white" size={26} />
//                   </div>
//                   <h2 className="text-lg font-bold">{card.title}</h2>
//                 </div>

//                 <ChevronRight
//                   className={`transition-transform ${
//                     openCard === card.id ? 'rotate-90' : ''
//                   }`}
//                   size={22}
//                 />
//               </div>

//               {/* CONTENT DROPDOWN */}
//               <div
//                 className={`transition-all overflow-hidden ${
//                   openCard === card.id ? 'max-h-[800px] mt-4' : 'max-h-0'
//                 }`}
//               >
//                 {card.content}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// import {
//   ChevronRight,
//   GraduationCap,
//   Building2,
//   Users,
//   Upload,
//   Copy,
//   Check,
//   Send,
// } from 'lucide-react';

// export default function BringZobsAI() {
//   const [openCard, setOpenCard] = useState(null);
//   const [copied, setCopied] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const [tpoData, setTpoData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     university: '',
//   });

//   const [companyData, setCompanyData] = useState({
//     role: '',
//     document: null,
//   });

//   const whatsappMessage =
//     'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

//   const handleCopy = () => {
//     navigator.clipboard.writeText(whatsappMessage);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleTpoChange = (e) =>
//     setTpoData({ ...tpoData, [e.target.name]: e.target.value });

//   const handleCompanyChange = (e) =>
//     setCompanyData({ ...companyData, [e.target.name]: e.target.value });

//   const handleCompanyDocUpload = (e) =>
//     setCompanyData({ ...companyData, document: e.target.files[0] });

//   const submitTpo = () => {
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 1500);
//   };

//   const submitCompany = () => {
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 1500);
//   };

//   const cards = [
//     {
//       id: 'student',
//       title: 'I am a Student',
//       description:
//         'Submit your TPO contact and get 1 month Pro plan for FREE once your university is onboarded.',
//       icon: GraduationCap,
//       gradient: 'from-blue-600 to-cyan-500',
//       bgGradient: 'from-blue-50 to-cyan-50',
//       buttonColor: 'bg-blue-600 hover:bg-blue-700',
//     },
//     {
//       id: 'staff',
//       title: 'I am University Staff',
//       description:
//         'Get a ready message to send us on WhatsApp for university onboarding.',
//       icon: Users,
//       gradient: 'from-emerald-600 to-teal-500',
//       bgGradient: 'from-emerald-50 to-teal-50',
//       buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
//     },
//     {
//       id: 'company',
//       title: 'Bring ZobsAI to My Company',
//       description:
//         'Register your company, upload docs & get free job posting for 1 year.',
//       icon: Building2,
//       gradient: 'from-violet-600 to-purple-500',
//       bgGradient: 'from-violet-50 to-purple-50',
//       buttonColor: 'bg-violet-600 hover:bg-violet-700',
//     },
//   ];

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex justify-center p-6 overflow-hidden">
//       {/* BG ANIMATION */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
//           style={{ animationDelay: '1s' }}
//         />
//       </div>

//       <div className="max-w-4xl w-full relative z-10">
//         {/* HEADER */}
//         <div className="text-center space-y-4 mb-16">
//           <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Bring ZobsAI
//           </h1>
//           <p className="text-gray-600 text-lg max-w-lg mx-auto">
//             Transform your recruitment journey with AI-powered placement
//             solutions
//           </p>
//         </div>

//         {/* ROW CARDS */}
//         <div className="flex flex-col gap-6 mb-8">
//           {cards.map((card, idx) => {
//             const Icon = card.icon;
//             const isOpen = openCard === card.id;

//             return (
//               <div
//                 key={card.id}
//                 className="group relative bg-gradient-to-br rounded-lg shadow-md border border-gray-200/60"
//                 style={{
//                   animation: `slideUp 0.6s ease-out ${idx * 0.2}s backwards`,
//                 }}
//               >
//                 {/* Card Base */}
//                 <div
//                   className={`p-6 bg-gradient-to-br ${card.bgGradient} rounded-lg`}
//                 >
//                   {/* ROW HEADER (Icon + Title + Button) */}
//                   <div className="flex items-center justify-between gap-6 w-full">
//                     {/* LEFT ROW (ICON + TITLE) */}
//                     <div className="flex items-center gap-4 flex-1">
//                       {/* ICON */}
//                       <div
//                         className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
//                       >
//                         <Icon className="text-white" size={28} />
//                       </div>

//                       {/* TITLE */}
//                       <h2 className="text-lg font-bold text-gray-900">
//                         {card.title}
//                       </h2>
//                     </div>

//                     {/* BUTTON RIGHT */}
//                     <button
//                       onClick={() => setOpenCard(isOpen ? null : card.id)}
//                       className={`${card.buttonColor} text-white font-semibold py-3 px-5 rounded-lg transition-all duration-300 flex items-center gap-2 hover:shadow-lg active:scale-95`}
//                     >
//                       {isOpen ? 'Hide' : 'Get Started'}
//                       <ChevronRight
//                         className={`transition-transform ${
//                           isOpen ? 'rotate-90' : ''
//                         }`}
//                         size={20}
//                       />
//                     </button>
//                   </div>

//                   {/* DESCRIPTION BELOW ROW */}
//                   <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-2">
//                     {card.description}
//                   </p>

//                   {/* DROPDOWN SECTION */}
//                   <div
//                     className={`transition-all duration-500 overflow-hidden ${
//                       isOpen ? 'max-h-[900px] mt-4' : 'max-h-0'
//                     }`}
//                   >
//                     {/* === STUDENT FORM === */}
//                     {card.id === 'student' && (
//                       <div className="space-y-4">
//                         <Label>Name</Label>
//                         <Input
//                           name="name"
//                           value={tpoData.name}
//                           onChange={handleTpoChange}
//                         />

//                         <Label>Email</Label>
//                         <Input
//                           name="email"
//                           value={tpoData.email}
//                           onChange={handleTpoChange}
//                         />

//                         <Label>Phone</Label>
//                         <Input
//                           name="phone"
//                           value={tpoData.phone}
//                           onChange={handleTpoChange}
//                         />

//                         <Label>University</Label>
//                         <Input
//                           name="university"
//                           value={tpoData.university}
//                           onChange={handleTpoChange}
//                         />

//                         <button
//                           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
//                           onClick={submitTpo}
//                         >
//                           {submitted ? (
//                             <>
//                               <Check /> Submitted!
//                             </>
//                           ) : (
//                             <>
//                               <Send /> Submit
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     )}

//                     {/* === STAFF === */}
//                     {card.id === 'staff' && (
//                       <div className="space-y-4">
//                         <textarea
//                           className="w-full bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm h-28"
//                           readOnly
//                           value={whatsappMessage}
//                         />

//                         <button
//                           className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg flex items-center justify-center gap-2"
//                           onClick={handleCopy}
//                         >
//                           {copied ? (
//                             <>
//                               <Check /> Copied!
//                             </>
//                           ) : (
//                             <>
//                               <Copy /> Copy
//                             </>
//                           )}
//                         </button>

//                         <button
//                           className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
//                           onClick={() =>
//                             window.open(
//                               `https://wa.me/919661531033?text=${encodeURIComponent(
//                                 whatsappMessage,
//                               )}`,
//                               '_blank',
//                             )
//                           }
//                         >
//                           <Send /> WhatsApp
//                         </button>
//                       </div>
//                     )}

//                     {/* === COMPANY === */}
//                     {card.id === 'company' && (
//                       <div className="space-y-4">
//                         <Label>Your Role</Label>
//                         <Input
//                           name="role"
//                           value={companyData.role}
//                           onChange={handleCompanyChange}
//                           placeholder="Director, HR Manager..."
//                         />

//                         <Label>Upload Registration/GST/MSME Document</Label>
//                         <div className="border-2 border-dashed border-gray-300 hover:border-violet-500 bg-gray-50 hover:bg-violet-50/30 p-6 rounded-lg flex flex-col items-center gap-3 transition-all cursor-pointer">
//                           <div className="p-3 bg-violet-100 rounded-lg">
//                             <Upload className="text-violet-600" size={24} />
//                           </div>

//                           <input
//                             type="file"
//                             onChange={handleCompanyDocUpload}
//                             className="hidden"
//                             id="file-input"
//                           />
//                           <label
//                             htmlFor="file-input"
//                             className="cursor-pointer text-center"
//                           >
//                             <p className="text-sm font-medium">
//                               {companyData.document
//                                 ? companyData.document.name
//                                 : 'Click to upload or drag & drop'}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               PDF, DOC, JPG (Max 10MB)
//                             </p>
//                           </label>
//                         </div>

//                         <button
//                           className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
//                           onClick={submitCompany}
//                         >
//                           {submitted ? (
//                             <>
//                               <Check /> Registered!
//                             </>
//                           ) : (
//                             <>
//                               <Send /> Register
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Bottom text */}
//         <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
//           Questions? Reach out to us directly or explore our platform
//         </div>
//       </div>

//       <style>{`
//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   );
// }

// 'use client';

// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   GraduationCap,
//   Building2,
//   Users,
//   Upload,
//   Copy,
//   Check,
//   Send,
// } from 'lucide-react';

// export default function BringZobsAI() {
//   const [activeCard, setActiveCard] = useState('student'); // Default active
//   const [copied, setCopied] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const [tpoData, setTpoData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     university: '',
//   });

//   const [companyData, setCompanyData] = useState({
//     role: '',
//     document: null,
//   });

//   const whatsappMessage =
//     'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

//   const handleCopy = () => {
//     navigator.clipboard.writeText(whatsappMessage);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleTpoChange = (e) =>
//     setTpoData({ ...tpoData, [e.target.name]: e.target.value });

//   const handleCompanyChange = (e) =>
//     setCompanyData({ ...companyData, [e.target.name]: e.target.value });

//   const handleCompanyDocUpload = (e) =>
//     setCompanyData({ ...companyData, document: e.target.files[0] });

//   const submitTpo = () => {
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 1500);
//   };

//   const submitCompany = () => {
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 1500);
//   };

//   const cards = [
//     {
//       id: 'student',
//       title: 'I am a Student',
//       description:
//         'Submit your TPO contact and get 1 month Pro plan for FREE once your university is onboarded.',
//       icon: GraduationCap,
//       gradient: 'from-blue-600 to-cyan-500',
//       bgGradient: 'from-blue-50 to-cyan-50',
//     },
//     {
//       id: 'staff',
//       title: 'I am University Staff',
//       description:
//         'Get a ready message to send us on WhatsApp for university onboarding.',
//       icon: Users,
//       gradient: 'from-emerald-600 to-teal-500',
//       bgGradient: 'from-emerald-50 to-teal-50',
//     },
//     {
//       id: 'company',
//       title: 'Bring ZobsAI to My Company',
//       description:
//         'Register your company, upload docs & get free job posting for 1 year.',
//       icon: Building2,
//       gradient: 'from-violet-600 to-purple-500',
//       bgGradient: 'from-violet-50 to-purple-50',
//     },
//   ];

//   const renderDropdown = () => {
//     if (!activeCard) return null;

//     return (
//       <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
//         {/* STUDENT FORM */}
//         {activeCard === 'student' && (
//           <div className="space-y-4">
//             <Label>Name</Label>
//             <Input
//               name="name"
//               value={tpoData.name}
//               onChange={handleTpoChange}
//             />

//             <Label>Email</Label>
//             <Input
//               name="email"
//               value={tpoData.email}
//               onChange={handleTpoChange}
//             />

//             <Label>Phone</Label>
//             <Input
//               name="phone"
//               value={tpoData.phone}
//               onChange={handleTpoChange}
//             />

//             <Label>University</Label>
//             <Input
//               name="university"
//               value={tpoData.university}
//               onChange={handleTpoChange}
//             />

//             <button
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
//               onClick={submitTpo}
//             >
//               {submitted ? (
//                 <>
//                   <Check /> Submitted!
//                 </>
//               ) : (
//                 <>
//                   <Send /> Submit
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {/* STAFF */}
//         {activeCard === 'staff' && (
//           <div className="space-y-4">
//             <textarea
//               className="w-full bg-gray-50 border p-4 rounded-lg h-28 text-sm"
//               readOnly
//               value={whatsappMessage}
//             />

//             <button
//               onClick={handleCopy}
//               className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg flex items-center justify-center gap-2"
//             >
//               {copied ? (
//                 <>
//                   <Check /> Copied!
//                 </>
//               ) : (
//                 <>
//                   <Copy /> Copy
//                 </>
//               )}
//             </button>

//             <button
//               onClick={() =>
//                 window.open(
//                   `https://wa.me/919661531033?text=${encodeURIComponent(
//                     whatsappMessage,
//                   )}`,
//                   '_blank',
//                 )
//               }
//               className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
//             >
//               <Send /> WhatsApp
//             </button>
//           </div>
//         )}

//         {/* COMPANY */}
//         {activeCard === 'company' && (
//           <div className="space-y-4">
//             <Label>Your Role</Label>
//             <Input
//               name="role"
//               value={companyData.role}
//               onChange={handleCompanyChange}
//             />

//             <Label>Upload Registration/GST/MSME Document</Label>
//             <div className="border-2 border-dashed p-6 rounded-lg text-center">
//               <Upload className="mx-auto text-violet-600" />
//               <input
//                 type="file"
//                 className="hidden"
//                 id="doc-file"
//                 onChange={handleCompanyDocUpload}
//               />
//               <label htmlFor="doc-file" className="cursor-pointer block mt-2">
//                 {companyData.document
//                   ? companyData.document.name
//                   : 'Upload document'}
//               </label>
//             </div>

//             <button
//               className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
//               onClick={submitCompany}
//             >
//               {submitted ? (
//                 <>
//                   <Check /> Registered!
//                 </>
//               ) : (
//                 <>
//                   <Send /> Register
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* HEADER */}
//       {/* HEADER */}
//       <div className="text-center space-y-4 mb-8">
//         <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text py-2 text-transparent">
//           Bring ZobsAI
//         </h1>
//         <p className="text-gray-600 text-lg max-w-lg mx-auto">
//           Transform your recruitment journey with AI-powered placement solutions
//         </p>
//       </div>

//       {/* RESPONSIVE CARD ROW */}
//       <div
//         className="
//   grid
//   grid-cols-1
//   sm:grid-cols-2
//   lg:grid-cols-3
//   gap-6
//   w-full
//   px-2 sm:px-4
// "
//       >
//         {cards.map((card) => {
//           const Icon = card.icon;
//           const isActive = activeCard === card.id;

//           return (
//             <div
//               key={card.id}
//               onClick={() => setActiveCard(card.id)}
//               className={`
//           w-full
//           min-h-[170px]
//           p-7
//           rounded-lg
//           cursor-pointer
//           border
//           bg-gradient-to-br ${card.bgGradient}
//           transition-all duration-300
//           ${isActive ? 'shadow-xl border-blue-400 scale-[1.03]' : 'shadow-md'}
//         `}
//             >
//               {/* ICON + TITLE */}
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
//                 >
//                   <Icon size={28} />
//                 </div>

//                 <h2 className="text-base font-bold leading-tight">
//                   {card.title}
//                 </h2>
//               </div>

//               {/* DESCRIPTION */}
//               <p className="text-gray-600 text-sm mt-3 leading-relaxed">
//                 {card.description}
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* FULL-WIDTH DROPDOWN */}
//       {renderDropdown()}
//     </div>
//   );
// }

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
    document: null,
  });

  const whatsappMessage =
    'Hello! I would like to bring ZobsAI to our university to improve placements. Please share details about the onboarding process.';

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTpoChange = (e) =>
    setTpoData({ ...tpoData, [e.target.name]: e.target.value });

  const handleCompanyChange = (e) =>
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });

  const handleCompanyDocUpload = (e) =>
    setCompanyData({ ...companyData, document: e.target.files[0] });

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
        'Submit your TPO contact and get 1 month Pro plan for FREE once your university is onboarded.',
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
          <div className="space-y-4">
            <Label>Your Role</Label>
            <Input
              name="role"
              value={companyData.role}
              onChange={handleCompanyChange}
            />

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
      {' '}
      {/* <- WIDER PAGE NOW */}
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
              
                p-4                  /* Bigger padding */
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
