// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import {
//   Check,
//   Edit,
//   File,
//   Sparkles,
//   UploadCloud,
//   User,
//   X,
// } from 'lucide-react';
// import React, { useState } from 'react';
// import { Button } from 'react-day-picker';
// const dummyUser = {
//   name: 'Alex Rider',
//   email: 'alex.rider@example.com',
//   avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
//   memberSince: 'October 2024',
//   totalOrders: 12,
//   totalSpent: 24567,
//   rewardPoints: 450,
// };
// const SideSectionProfile = ({
//   personalInfoForm,
//   fileInputRef,
//   file,
//   isDragging,
//   isUploading,
//   progress,
//   handleFileChange,
//   handleButtonClick,
//   handleDragEnter,
//   handleDragLeave,
//   handleDragOver,
//   handleDrop,
//   handleRemoveFile,
//   handleUpload,

//   handlePersonalInfoSubmit,
//   isNameEditable,
//   handlePersonalInfoEdit,
//   toggleNameEdit,
//   isEmailEditable,
//   isPhoneEditable,
//   toggleEmailEdit,
//   setHandleName,
//   handleCancelEdit,
// }: any) => {
//   const { fullName, email, phone } = personalInfoForm.control._formValues;
//   // const [progress, setProgress] = useState(0);

//   return (
//     <div>
//       <aside className=" w-full lg:w-80 space-y-5">
//         <div className="relative group">
//           <div className="absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

//           <div className="relative bg-white p-8 border border-gray-200 rounded-3xl shadow-lg ">
//             <div className="flex flex-col items-center text-center mb-6">
//               <div className="relative mb-4">
//                 <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
//                 <img
//                   src={dummyUser.avatar}
//                   alt="Avatar"
//                   className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg"
//                 />
//                 <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
//                   <Edit size={14} />
//                 </button>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-1">
//                 {fullName}
//               </h2>
//               <p className="text-sm text-gray-600 ">{email}</p>
//               <p className="text-sm text-gray-600 ">{phone}</p>

//               {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
//             <Award size={16} />
//             <span>{dummyUser.rewardPoints} Points</span>
//           </div> */}
//             </div>

//             {/* <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
//               <div className="text-center p-3 bg-blue-50 rounded-xl">
//                 <p className="text-2xl font-black text-blue-600">
//                   {dummyUser.totalOrders}
//                 </p>
//                 <p className="text-xs text-gray-600 font-semibold">
//                   Total Orders
//                 </p>
//               </div>
//               <div className="text-center p-3 bg-purple-50 rounded-xl">
//                 <p className="text-2xl font-black text-purple-600">
//                   ₹{(dummyUser.totalSpent / 1000).toFixed(1)}k
//                 </p>
//                 <p className="text-xs text-gray-600 font-semibold">
//                   Total Spent
//                 </p>
//               </div>
//             </div> */}
//           </div>
//         </div>

//         <div>
//           <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-lg">
//             <div className="text-center mb-6">
//               {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4">
//                 <UploadCloud className="h-8 w-8 text-white" />
//               </div> */}
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 Upload Your CV
//               </h3>
//               <p className="text-gray-600">
//                 Let AI analyze and populate your profile details.
//               </p>
//             </div>

//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
//               className="hidden"
//               accept=".pdf,.doc,.docx,.txt"
//             />

//             <div
//               className={`relative w-full h-48 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
//                 isDragging
//                   ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-105'
//                   : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
//               }`}
//               onClick={handleButtonClick}
//               onDragEnter={handleDragEnter}
//               onDragLeave={handleDragLeave}
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//             >
//               <div className="flex flex-col items-center justify-center gap-3 h-full">
//                 <div
//                   className={`p-4 rounded-full transition-colors duration-300 ${
//                     isDragging
//                       ? 'bg-cyan-500 text-white'
//                       : 'bg-cyan-100 text-cyan-600'
//                   }`}
//                 >
//                   <UploadCloud className="w-8 h-8" />
//                 </div>
//                 <div>
//                   <p className="text-lg font-medium text-gray-700 mb-1">
//                     {isDragging
//                       ? 'Drop your file here'
//                       : 'Drag & drop your CV here'}
//                   </p>
//                   <p className="text-sm text-gray-500">or click to browse</p>
//                   <p className="text-xs text-gray-400 mt-2">
//                     Supports PDF, DOC, DOCX, TXT
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {file && (
//               <div className="mt-6 flex flex-col items-center gap-4">
//                 {!isUploading ? (
//                   <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <File className="w-6 h-6 text-blue-600" />
//                     </div>
//                     <div className="flex-1 overflow-hidden">
//                       <p className="font-medium text-gray-800 truncate">
//                         {file.name}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {(file.size / 1024).toFixed(1)} KB
//                       </p>
//                     </div>

//                     <button
//                       variant="ghost"
//                       size="icon"
//                       onClick={handleRemoveFile}
//                       className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                 ) : null}
//                 {/*
//                 <button
//                   onClick={handleUpload}
//                   disabled={isUploading}
//                   className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
//                 >
//                   {isUploading ? (
//                     <>
//                       <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
//                       Processing...
//                       <span className="animate-pulse">
//                         Calculating...{progress}%
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="h-5 w-5 mr-2" />
//                       Process CV
//                     </>
//                   )}
//                 </button> */}

//                 <button
//                   onClick={handleUpload}
//                   disabled={isUploading}
//                   className=" w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
//                 >
//                   {isUploading ? (
//                     <>
//                       <div className="w-full bg-cyan-100 rounded-full h-3 overflow-hidden">
//                         <div
//                           className="h-3 bg-gradient-to-r from-yellow-600 to-blue-600 rounded-full transition-all duration-300"
//                           style={{ width: `${progress}%` }}
//                         ></div>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
//                         <div className="text-sm font-medium">
//                           Processing... {progress}%
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-2">
//                         <Sparkles className=" h-5 w-5" />
//                         Process CV
//                       </div>
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default SideSectionProfile;

// 'use client';
// import React, { useState } from 'react';
// import { Edit, UploadCloud, X, Sparkles, Camera } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// const dummyUser = {
//   avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
// };

// const SideSectionProfile = ({
//   personalInfoForm,
//   fileInputRef,
//   file,
//   isDragging,
//   isUploading,
//   progress,
//   handleFileChange,
//   handleButtonClick,
//   handleDragEnter,
//   handleDragLeave,
//   handleDragOver,
//   handleDrop,
//   handleRemoveFile,
//   handleUpload,
// }: any) => {
//   const { fullName, email, phone } = personalInfoForm.control._formValues;

//   // Modal + Profile state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: fullName,
//     email: email,
//     phone: phone,
//     image: dummyUser.avatar,
//   });
//   const [preview, setPreview] = useState<string | null>(formData.image);

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setPreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSave = () => {
//     // Update values in main form if needed
//     personalInfoForm.setValue('fullName', formData.fullName);
//     personalInfoForm.setValue('email', formData.email);
//     personalInfoForm.setValue('phone', formData.phone);
//     setIsModalOpen(false);
//   };

//   return (
//     <div>
//       <aside className="w-full lg:w-80 space-y-5">
//         {/* Profile Card */}
//         <div className="relative bg-white p-8 border border-gray-200 rounded-3xl shadow-lg">
//           <div className="flex flex-col items-center text-center mb-6">
//             <div className="relative mb-4">
//               <img
//                 src={preview || dummyUser.avatar}
//                 alt="Avatar"
//                 className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
//               />
//             </div>

//             <h2 className="text-xl font-semibold text-gray-900 mb-1">
//               {formData.fullName}
//             </h2>
//             <p className="text-sm text-gray-600">{formData.email}</p>
//             <p className="text-sm text-gray-600 mb-3">{formData.phone}</p>

//             {/* ✅ Edit button below phone */}
//             <Button
//               onClick={() => setIsModalOpen(true)}
//               className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
//             >
//               <Edit size={16} /> Edit Profile
//             </Button>
//           </div>
//         </div>

//         {/* Upload CV Section */}
//         <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-lg">
//           <div className="text-center mb-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">
//               Upload Your CV
//             </h3>
//             <p className="text-gray-600">
//               Let AI analyze and populate your profile details.
//             </p>
//           </div>

//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
//             className="hidden"
//             accept=".pdf,.doc,.docx,.txt"
//           />

//           <div
//             className={`relative w-full h-48 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
//               isDragging
//                 ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-105'
//                 : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
//             }`}
//             onClick={handleButtonClick}
//             onDragEnter={handleDragEnter}
//             onDragLeave={handleDragLeave}
//             onDragOver={handleDragOver}
//             onDrop={handleDrop}
//           >
//             <div className="flex flex-col items-center justify-center gap-3 h-full">
//               <div
//                 className={`p-4 rounded-full transition-colors duration-300 ${
//                   isDragging
//                     ? 'bg-cyan-500 text-white'
//                     : 'bg-cyan-100 text-cyan-600'
//                 }`}
//               >
//                 <UploadCloud className="w-8 h-8" />
//               </div>
//               <div>
//                 <p className="text-lg font-medium text-gray-700 mb-1">
//                   {isDragging
//                     ? 'Drop your file here'
//                     : 'Drag & drop your CV here'}
//                 </p>
//                 <p className="text-sm text-gray-500">or click to browse</p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   Supports PDF, DOC, DOCX, TXT
//                 </p>
//               </div>
//             </div>
//           </div>

//           {file && (
//             <div className="mt-6 flex flex-col items-center gap-4">
//               <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Sparkles className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="flex-1 overflow-hidden">
//                   <p className="font-medium text-gray-800 truncate">
//                     {file.name}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {(file.size / 1024).toFixed(1)} KB
//                   </p>
//                 </div>
//                 <button
//                   onClick={handleRemoveFile}
//                   className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <button
//                 onClick={handleUpload}
//                 disabled={isUploading}
//                 className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
//               >
//                 {isUploading ? (
//                   <>
//                     <div className="w-full bg-cyan-100 rounded-full h-3 overflow-hidden">
//                       <div
//                         className="h-3 bg-gradient-to-r from-yellow-600 to-blue-600 rounded-full transition-all duration-300"
//                         style={{ width: `${progress}%` }}
//                       ></div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
//                       <div className="text-sm font-medium">
//                         Processing... {progress}%
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles className="h-5 w-5" />
//                     Process CV
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </aside>

//       {/* 🧩 Edit Profile Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Edit Profile</DialogTitle>
//           </DialogHeader>

//           {/* Profile Image Upload */}
//           <div className="flex flex-col items-center mb-4">
//             <div className="relative">
//               <img
//                 src={preview || dummyUser.avatar}
//                 alt="Profile"
//                 className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow"
//               />
//               <label
//                 htmlFor="profile-pic"
//                 className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
//               >
//                 <Camera className="h-4 w-4 text-white" />
//               </label>
//               <input
//                 id="profile-pic"
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleFileUpload}
//               />
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <Input
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 placeholder="Enter your name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <Input
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Phone
//               </label>
//               <Input
//                 name="phone"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 placeholder="Enter your phone number"
//               />
//             </div>
//           </div>

//           <DialogFooter className="mt-6 flex justify-end gap-3">
//             <Button variant="outline" onClick={() => setIsModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default SideSectionProfile;

// 'use client';
// import React, { useState } from 'react';
// import { Edit, UploadCloud, X, Sparkles, Camera, Check } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// // Dummy avatar for fallback
// const dummyUser = {
//   avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
// };

// const SideSectionProfile = ({
//   personalInfoForm,
//   fileInputRef,
//   file,
//   isDragging,
//   isUploading,
//   progress,
//   handleFileChange,
//   handleButtonClick,
//   handleDragEnter,
//   handleDragLeave,
//   handleDragOver,
//   handleDrop,
//   handleRemoveFile,
//   handleUpload,
//   handlePersonalInfoEdit, // ✅ from old code
//   handleCancelEdit, // ✅ from old code
// }: any) => {
//   const { fullName, email, phone } = personalInfoForm.control._formValues;

//   // Modal + Profile state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: fullName,
//     email: email,
//     phone: phone,
//     image: dummyUser.avatar,
//   });
//   const [preview, setPreview] = useState<string | null>(formData.image);

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setPreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   // ✅ Integrated save handler using old edit logic
//   const handleSave = async () => {
//     try {
//       // Update local form
//       personalInfoForm.setValue('fullName', formData.fullName);
//       personalInfoForm.setValue('email', formData.email);
//       personalInfoForm.setValue('phone', formData.phone);

//       // Trigger backend update using existing edit function
//       await handlePersonalInfoEdit('fullName');
//       await handlePersonalInfoEdit('email');
//       await handlePersonalInfoEdit('phone');

//       setIsModalOpen(false);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//     }
//   };

//   return (
//     <div>
//       <aside className="w-full lg:w-80 space-y-5">
//         {/* Profile Card */}
//         <div className="relative bg-white p-8 border border-gray-200 rounded-3xl shadow-lg">
//           <div className="flex flex-col items-center text-center mb-6">
//             <div className="relative mb-4">
//               <img
//                 src={preview || dummyUser.avatar}
//                 alt="Avatar"
//                 className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
//               />
//             </div>

//             <h2 className="text-xl font-semibold text-gray-900 mb-1">
//               {formData.fullName}
//             </h2>
//             <p className="text-sm text-gray-600">{formData.email}</p>
//             <p className="text-sm text-gray-600 mb-3">{formData.phone}</p>

//             {/* ✅ Edit button */}
//             <Button
//               onClick={() => setIsModalOpen(true)}
//               className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
//             >
//               <Edit size={16} /> Edit Profile
//             </Button>
//           </div>
//         </div>

// {/* Upload CV Section (unchanged) */}
// <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-lg">
//   <div className="text-center mb-6">
//     <h3 className="text-xl font-semibold text-gray-800 mb-2">
//       Upload Your CV
//     </h3>
//     <p className="text-gray-600">
//       Let AI analyze and populate your profile details.
//     </p>
//   </div>

//   <input
//     type="file"
//     ref={fileInputRef}
//     onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
//     className="hidden"
//     accept=".pdf,.doc,.docx,.txt"
//   />

//   <div
//     className={`relative w-full h-48 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
//       isDragging
//         ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-105'
//         : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
//     }`}
//     onClick={handleButtonClick}
//     onDragEnter={handleDragEnter}
//     onDragLeave={handleDragLeave}
//     onDragOver={handleDragOver}
//     onDrop={handleDrop}
//   >
//     <div className="flex flex-col items-center justify-center gap-3 h-full">
//       <div
//         className={`p-4 rounded-full transition-colors duration-300 ${
//           isDragging
//             ? 'bg-cyan-500 text-white'
//             : 'bg-cyan-100 text-cyan-600'
//         }`}
//       >
//         <UploadCloud className="w-8 h-8" />
//       </div>
//       <div>
//         <p className="text-lg font-medium text-gray-700 mb-1">
//           {isDragging
//             ? 'Drop your file here'
//             : 'Drag & drop your CV here'}
//         </p>
//         <p className="text-sm text-gray-500">or click to browse</p>
//         <p className="text-xs text-gray-400 mt-2">
//           Supports PDF, DOC, DOCX, TXT
//         </p>
//       </div>
//     </div>
//   </div>

//   {file && (
//     <div className="mt-6 flex flex-col items-center gap-4">
//       <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md">
//         <div className="p-2 bg-blue-100 rounded-lg">
//           <Sparkles className="w-6 h-6 text-blue-600" />
//         </div>
//         <div className="flex-1 overflow-hidden">
//           <p className="font-medium text-gray-800 truncate">
//             {file.name}
//           </p>
//           <p className="text-sm text-gray-500">
//             {(file.size / 1024).toFixed(1)} KB
//           </p>
//         </div>
//         <button
//           onClick={handleRemoveFile}
//           className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
//         >
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       <button
//         onClick={handleUpload}
//         disabled={isUploading}
//         className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
//       >
//         {isUploading ? (
//           <>
//             <div className="w-full bg-cyan-100 rounded-full h-3 overflow-hidden">
//               <div
//                 className="h-3 bg-gradient-to-r from-yellow-600 to-blue-600 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
//               <div className="text-sm font-medium">
//                 Processing... {progress}%
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             <Sparkles className="h-5 w-5" />
//             Process CV
//           </>
//         )}
//       </button>
//     </div>
//   )}
// </div>
//       </aside>

//       {/* 🧩 Edit Profile Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Edit Profile</DialogTitle>
//           </DialogHeader>

//           {/* Profile Image Upload */}
//           <div className="flex flex-col items-center mb-4">
//             <div className="relative">
//               <img
//                 src={preview || dummyUser.avatar}
//                 alt="Profile"
//                 className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow"
//               />
//               <label
//                 htmlFor="profile-pic"
//                 className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
//               >
//                 <Camera className="h-4 w-4 text-white" />
//               </label>
//               <input
//                 id="profile-pic"
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleFileUpload}
//               />
//             </div>
//           </div>

//           {/* Input Fields */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <Input
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 placeholder="Enter your name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <Input
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Phone
//               </label>
//               <Input
//                 name="phone"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 placeholder="Enter your phone number"
//               />
//             </div>
//           </div>

//           <DialogFooter className="mt-6 flex justify-end gap-3 ">
//             <Button variant="outline" onClick={() => setIsModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               className="bg-gradient-to-r from-cyan-500 to-blue-600"
//               onClick={handleSave}
//             >
//               <Check size={16} className="mr-2 " /> Save Changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default SideSectionProfile;

'use client';
import React, { useState } from 'react';
import { Edit, UploadCloud, X, Sparkles, Camera, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Dummy avatar for fallback
const dummyUser = {
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
};

const SideSectionProfile = ({
  personalInfoForm,
  fileInputRef,
  file,
  isDragging,
  isUploading,
  progress,
  handleFileChange,
  handleButtonClick,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleRemoveFile,
  handleUpload,
  handlePersonalInfoEdit,
  handleCancelEdit,
}: any) => {
  const { fullName, email, phone, jobPreference } =
    personalInfoForm.control._formValues;

  // ✅ Displayed profile info
  const [profileData, setProfileData] = useState({
    fullName,
    email,
    phone,
    jobPreference,
    image: dummyUser.avatar,
  });

  // ✅ Temporary form data for modal edits
  const [tempFormData, setTempFormData] = useState({ ...profileData });
  const [preview, setPreview] = useState<string | null>(profileData.image);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setTempFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Open modal with current data
  const openEditModal = () => {
    setTempFormData(profileData);
    setPreview(profileData.image);
    setIsModalOpen(true);
  };

  // ✅ Save only when clicked
  const handleSave = async () => {
    try {
      // Update main profile data from temp data
      setProfileData(tempFormData);

      // Update form values
      personalInfoForm.setValue('fullName', tempFormData.fullName);
      personalInfoForm.setValue('email', tempFormData.email);
      personalInfoForm.setValue('phone', tempFormData.phone);
      personalInfoForm.setValue('jobPreference', tempFormData.jobPreference);

      // Trigger backend update
      await handlePersonalInfoEdit('fullName');
      await handlePersonalInfoEdit('email');
      await handlePersonalInfoEdit('phone');
      await handlePersonalInfoEdit('jobPreference');

      setIsModalOpen(false);
      // console.log('Profile updated successfully', profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <aside className="w-full lg:w-80 space-y-5">
        {/* Profile Card */}
        <div className="relative bg-white p-8 border border-gray-200 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <img
                src={preview || dummyUser.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {profileData.fullName}
            </h2>
            <p className="text-sm text-gray-600">{profileData.email}</p>
            <p className="text-sm text-gray-600 ">{profileData.phone}</p>
            <p className="text-sm text-gray-600 mb-3">
              {profileData.jobPreference}
            </p>

            <Button
              onClick={openEditModal}
              className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <Edit size={16} /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Upload CV Section (unchanged) */}
        <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Upload Your CV
            </h3>
            <p className="text-gray-600">
              Let AI analyze and populate your profile details.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />

          <div
            className={`relative w-full h-48 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-105'
                : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
            }`}
            onClick={handleButtonClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-3 h-full">
              <div
                className={`p-4 rounded-full transition-colors duration-300 ${
                  isDragging
                    ? 'bg-cyan-500 text-white'
                    : 'bg-cyan-100 text-cyan-600'
                }`}
              >
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">
                  {isDragging
                    ? 'Drop your file here'
                    : 'Drag & drop your CV here'}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports PDF, DOC, DOCX, TXT
                </p>
              </div>
            </div>
          </div>

          {file && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-full bg-cyan-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-yellow-600 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <div className="text-sm font-medium">
                        Processing... {progress}%
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Process CV
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <img
                src={preview || dummyUser.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow"
              />
              <label
                htmlFor="profile-pic"
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
              >
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input
                id="profile-pic"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                name="fullName"
                value={tempFormData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={tempFormData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                name="phone"
                type="tel"
                value={tempFormData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Role
              </label>
              <Input
                name="jobPreference"
                value={tempFormData.jobPreference}
                onChange={handleChange}
                placeholder="Enter your job preference"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
              onClick={handleSave}
            >
              <Check size={16} className="mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SideSectionProfile;
