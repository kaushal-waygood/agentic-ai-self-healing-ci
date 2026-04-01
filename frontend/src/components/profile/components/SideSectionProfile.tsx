'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Edit,
  UploadCloud,
  X,
  Camera,
  FileText,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Loader2,
  ExternalLink,
  Linkedin,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { useProfile } from '@/hooks/useProfile';
import apiInstance from '@/services/api';
import { useDispatch } from 'react-redux';
import {
  getStudentDetailsRequest,
  getStudentEducationRequest,
  getStudentExperienceRequest,
  getStudentSkllsRequest,
  getAllProjectsRequest,
} from '@/redux/reducers/studentReducer';
import { useToast } from '@/hooks/use-toast';
import { SimplePhoneInput } from '@/components/common/SimplePhoneInput';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const SideSectionProfile = () => {
  const {
    profile,
    setProfile,
    file,
    setFile,
    fileInputRef,
    updateProfile,
    setProfileImageFile,
  } = useProfile();

  const [localFormData, setLocalFormData] = useState({ ...profile });
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(profile.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    jobRole: '',
    location: '',
  });
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLinkedInConnecting, setIsLinkedInConnecting] = useState(false);
  const [isLinkedInDocumentUploading, setIsLinkedInDocumentUploading] =
    useState(false);
  const linkedInDocumentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (localIsModalOpen) {
      setLocalFormData({ ...profile });
      setPreview(profile.avatar || '');
    }
  }, [localIsModalOpen, profile]);

  useEffect(() => {
    if (localFormData.phone && isValidPhoneNumber(localFormData.phone)) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  }, [localFormData.phone]);

  useEffect(() => {
    const linkedinStatus = searchParams.get('linkedin');
    if (!linkedinStatus) return;

    if (linkedinStatus === 'success') {
      const importedFields =
        searchParams
          .get('linkedin_fields')
          ?.split(',')
          .filter(Boolean)
          .join(', ') || '';

      toast({
        title: 'LinkedIn profile imported',
        description: importedFields
          ? `Imported ${importedFields}. Skills still import best from your CV or manual profile sections.`
          : 'Basic LinkedIn details were connected. Skills still import best from your CV or manual profile sections.',
      });
    } else {
      toast({
        title: 'LinkedIn import failed',
        variant: 'destructive',
        description: 'We could not import your LinkedIn profile. Please try again.',
      });
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('linkedin');
    nextParams.delete('linkedin_fields');

    const nextQuery = nextParams.toString();
    router.replace(
      nextQuery ? `/dashboard/profile?${nextQuery}` : '/dashboard/profile',
      { scroll: false },
    );
  }, [router, searchParams, toast]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];
    if (!img) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(img.type)) {
      toast({
        title: 'Invalid file type',
        variant: 'destructive',
        description: `Please upload only JPG or PNG images.`,
      });
      e.target.value = '';
      return;
    }

    setProfileImageFile(img);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(img);
    e.target.value = '';
  };

  /* --- Drag and Drop Handlers --- */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // setFile(droppedFiles[0]);
      handleFileValidation(droppedFiles[0]);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      await updateProfile(localFormData);
      setProfile(localFormData);
      setLocalIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInImport = useCallback(async () => {
    try {
      setIsLinkedInConnecting(true);
      const { data } = await apiInstance.get('/user/linkedin/import-url');
      const authUrl = data?.authUrl;

      if (!authUrl) {
        throw new Error('Missing LinkedIn auth URL');
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start LinkedIn import:', error);
      setIsLinkedInConnecting(false);
      toast({
        title: 'Unable to connect LinkedIn',
        variant: 'destructive',
        description: 'Please try again in a moment.',
      });
    }
  }, [toast]);

  const handleLinkedInDocumentPicker = useCallback(() => {
    linkedInDocumentInputRef.current?.click();
  }, []);

  const refreshImportedProfile = useCallback(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(getStudentEducationRequest());
    dispatch(getStudentExperienceRequest());
    dispatch(getStudentSkllsRequest());
    dispatch(getAllProjectsRequest());
  }, [dispatch]);

  const handleLinkedInDocumentUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      event.target.value = '';

      if (!selectedFile) return;

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid LinkedIn file',
          variant: 'destructive',
          description: 'Upload a LinkedIn PDF or DOCX export.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('cv', selectedFile);

      try {
        setIsLinkedInDocumentUploading(true);
        await apiInstance.post('/user/linkedin/import-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        refreshImportedProfile();
        toast({
          title: 'LinkedIn profile imported',
          description:
            'Education, experience, skills, and projects were updated from your uploaded LinkedIn document.',
        });
      } catch (error) {
        console.error('LinkedIn document import failed:', error);
        toast({
          title: 'LinkedIn document import failed',
          variant: 'destructive',
          description: 'Please upload a clearer PDF or DOCX export and try again.',
        });
      } finally {
        setIsLinkedInDocumentUploading(false);
      }
    },
    [refreshImportedProfile, toast],
  );

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('cv', file);
    let rampTimer: ReturnType<typeof setInterval> | null = null;

    rampTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return Math.min(95, prev + Math.floor(Math.random() * 8 + 2));
        }
        if (rampTimer) {
          clearInterval(rampTimer);
          rampTimer = null;
        }
        return prev;
      });
    }, 800);

    try {
      await apiInstance.post('/students/resume/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(getStudentDetailsRequest());
      dispatch(getStudentEducationRequest());
      setFile(null);
    } catch (error) {
      console.log(error);
      console.error('Error uploading CV:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const handleCancel = () => {
    setLocalFormData({ ...profile });
    setPreview(profile.avatar || '');
    setProfileImageFile(null);
    setErrors({ fullName: '', phone: '', jobRole: '', location: '' });
    setLocalIsModalOpen(false);
  };

  const handleFileValidation = (selectedFile: File) => {
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid file type',
        variant: 'destructive',
        description: `Please upload a PDF, DOC, or DOCX file.`,
      });
      setFile(null);
    }
  };

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: '', phone: '', jobRole: '', location: '' };

    // Full Name: Required, at least 2 characters
    if (localFormData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name is required.';
      isValid = false;
    } else if (localFormData.fullName.trim().length > 20) {
      newErrors.fullName = 'Full Name must be at least 20 characters.';
      isValid = false;
    }

    // if (!/^\d{10}$/.test(localFormData.phone)) {
    //   newErrors.phone = 'Phone must be exactly 10 digits.';
    //   isValid = false;
    // }
    // if (!localFormData.phone.trim()) {
    if (!localFormData.phone) {
      newErrors.phone = 'Phone number is required.';
      isValid = false;
      // } else if (!/^\d+$/.test(localFormData.phone)) {
    } else if (!isValidPhoneNumber(localFormData.phone)) {
      newErrors.phone = 'Please enter a valid international phone number.';
      isValid = false;
    }

    if (localFormData.jobRole.trim().length < 2) {
      newErrors.jobRole = 'Job Role is required.';
      isValid = false;
    } else if (localFormData.jobRole.trim().length > 30) {
      newErrors.jobRole = 'Job Role must be at least 30 characters.';
      isValid = false;
    }

    // if (localFormData.location.trim().length < 2) {
    //   newErrors.location = 'Location is required (e.g., City, Country).';
    //   isValid = false;
    // } else if (localFormData.location.trim().length > 30) {
    //   newErrors.location = 'Location must be at least 30 characters.';
    //   isValid = false;
    // }
    if (!localFormData.location.trim()) {
      newErrors.location = 'Location is required (e.g., City, Country).';
      isValid = false;
    } else if (localFormData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters.';
      isValid = false;
    } else if (localFormData.location.trim().length > 50) {
      newErrors.location = 'Location must not exceed 50 characters.';
      isValid = false;
    } else if (!/^[a-zA-Z\s,.'-]+$/.test(localFormData.location)) {
      newErrors.location =
        'Please enter a valid city or region (letters, spaces, commas, periods, apostrophes, and hyphens only).';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  // return (
  //   <aside className="w-full lg:w-80 space-y-4 p-3 max-h-[80vh] overflow-y-auto">
  //     {/* Profile Card */}
  //     <div className="border rounded-lg p-3 text-center bg-white shadow-sm">
  //       <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-blue-500 text-white text-4xl font-semibold overflow-hidden">
  //         {profile.avatar ? (
  //           <Image
  //             src={profile.avatar}
  //             alt="Avatar"
  //             width={96}
  //             height={96}
  //             className="object-cover h-full w-full"
  //           />
  //         ) : (
  //           getInitials(profile.fullName)
  //         )}
  //       </div>

  //       <h2 className="mt-2 text-lg font-semibold text-gray-900">
  //         {profile.fullName || 'Your Name'}
  //       </h2>
  //       <div className="space-y-1 mt-2 text-sm text-gray-500">
  //         <p className="flex items-center justify-center gap-2">
  //           <Mail className="w-4 h-4" /> {profile.email}
  //         </p>
  //         {profile.phone && (
  //           <p className="flex items-center justify-center gap-2">
  //             <Phone className="w-4 h-4" /> {profile.phone}
  //           </p>
  //         )}
  //         {profile.jobRole && (
  //           <p className="flex items-center justify-center gap-1">
  //             <Briefcase className="w-4 h-4" /> {profile.jobRole}
  //           </p>
  //         )}

  //         {profile.location && (
  //           <p className="flex items-center justify-center gap-2">
  //             <MapPin className="w-4 h-4" /> {profile.location}
  //           </p>
  //         )}
  //       </div>
  //       <Button
  //         onClick={() => setLocalIsModalOpen(true)}
  //         className="mt-4 w-full gap-2"
  //       >
  //         <Edit size={16} /> Edit Profile
  //       </Button>
  //     </div>

  //     {/* CV Section */}
  //     <div className="border rounded-lg p-3 bg-white text-center">
  //       {profile.uploadedCV ? (
  //         <a
  //           href={profile.uploadedCV}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="flex items-center justify-center gap-2 text-blue-600 hover:underline"
  //         >
  //           <FileText className="w-5 h-5" /> View Current CV
  //         </a>
  //       ) : (
  //         <p className="text-sm text-gray-400">No CV uploaded</p>
  //       )}
  //     </div>

  //     {/* Upload Area */}

  //     {/* 1. Only show the Upload Area if NO file is selected */}
  //     {!file ? (
  //       <div
  //         onDragEnter={handleDragEnter}
  //         onDragOver={handleDragOver}
  //         onDragLeave={handleDragLeave}
  //         onDrop={handleDrop}
  //         onClick={handleButtonClick}
  //         className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
  //           isDragging
  //             ? 'border-blue-500 bg-blue-50'
  //             : 'border-gray-300 hover:bg-gray-50'
  //         }`}
  //       >
  //         <input
  //           type="file"
  //           ref={fileInputRef}
  //           className="hidden"
  //           accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //           onChange={(e) => {
  //             const selectedFile = e.target.files?.[0];
  //             if (selectedFile) {
  //               handleFileValidation(selectedFile);
  //             }
  //             e.target.value = '';
  //           }}
  //         />
  //         <UploadCloud className="mx-auto w-8 h-8 text-gray-400 mb-2" />
  //         <p className="text-sm font-medium">
  //           {isDragging ? 'Drop it here!' : 'Drop CV here'}
  //         </p>
  //         <p className="text-xs text-gray-400">or click to browse</p>
  //         <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, DOCX</p>
  //       </div>
  //     ) : (
  //       /* 2. Show the File Info / Process button if a file IS selected */
  //       <div className=" flex flex-col bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
  //         <div className="flex items-center gap-3 p-3 rounded-lg w-full max-w-md">
  //           <div className="flex-1 overflow-hidden">
  //             <p className="text-sm font-medium text-gray-800 break-all">
  //               {file.name}
  //             </p>
  //             <p className="text-xs text-gray-500">
  //               {(file.size / 1024).toFixed(1)} KB
  //             </p>
  //           </div>
  //           <button
  //             onClick={() => setFile(null)}
  //             className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-full flex-shrink-0"
  //           >
  //             <X className="h-5 w-5" />
  //           </button>
  //         </div>

  //         <div className="w-full px-3 pb-3">
  //           <button
  //             onClick={handleUpload}
  //             disabled={isUploading}
  //             className="w-full  font-semibold py-2 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2"
  //           >
  //             {isUploading ? (
  //               <>
  //                 <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
  //                   <div
  //                     className="h-full bg-blue-600 rounded-full transition-all duration-200"
  //                     style={{ width: `${progress}%` }}
  //                   ></div>
  //                 </div>
  //                 <span className="text-xs ">Processing... {progress}%</span>
  //               </>
  //             ) : (
  //               <Button className="">Process CV</Button>
  //             )}
  //           </button>
  //         </div>
  //       </div>
  //     )}

  //     {/* Edit Modal */}
  //     <Dialog open={localIsModalOpen} onOpenChange={setLocalIsModalOpen}>
  //       <DialogContent className="max-w-md bg-white">
  //         <DialogHeader>
  //           <DialogTitle>Edit Profile</DialogTitle>
  //         </DialogHeader>

  //         <div className="flex justify-center mb-4">
  //           <div className="relative">
  //             <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-500 text-white text-4xl font-semibold overflow-hidden">
  //               {preview ? (
  //                 <Image
  //                   src={preview}
  //                   alt="Avatar"
  //                   width={96}
  //                   height={96}
  //                   className="object-cover h-full w-full"
  //                 />
  //               ) : (
  //                 getInitials(profile.fullName)
  //               )}
  //             </div>
  //             <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg">
  //               <Camera className="w-4 h-4 text-white" />
  //               <input
  //                 type="file"
  //                 // accept="image/*"
  //                 accept=".jpg,.jpeg,.png,image/jpeg,image/png"
  //                 className="hidden"
  //                 onChange={onAvatarChange}
  //               />
  //             </label>
  //           </div>
  //         </div>

  //         <form className="space-y-3">
  //           {/* Full Name - existing */}
  //           <div>
  //             <label className="text-xs font-bold uppercase text-gray-500">
  //               Full Name
  //             </label>
  //             <Input
  //               name="fullName"
  //               value={localFormData.fullName || ''}
  //               onChange={onChange}
  //               className={
  //                 errors.fullName
  //                   ? 'border-red-500 focus-visible:ring-red-500'
  //                   : ''
  //               }
  //               placeholder="Enter your full name"
  //             />
  //             {errors.fullName && (
  //               <p className="text-[10px] text-red-500 mt-1">
  //                 {errors.fullName}
  //               </p>
  //             )}
  //           </div>

  //           {/* Phone */}
  //           <div>
  //             <label className="text-xs font-bold uppercase text-gray-500">
  //               Phone
  //             </label>
  //             {/* <Input
  //               name="phone"
  //               value={localFormData.phone || ''}
  //               onChange={onChange}
  //               className={
  //                 errors.phone
  //                   ? 'border-red-500 focus-visible:ring-red-500'
  //                   : ''
  //               }
  //             /> */}
  //             <SimplePhoneInput
  //               value={localFormData.phone || ''}
  //               onChange={(phone) =>
  //                 setLocalFormData((prev) => ({ ...prev, phone }))
  //               }
  //             />
  //             {errors.phone && (
  //               <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>
  //             )}
  //           </div>

  //           {/* Job Role */}
  //           <div>
  //             <label className="text-xs font-bold uppercase text-gray-500">
  //               Job Role
  //             </label>
  //             <Input
  //               name="jobRole"
  //               value={localFormData.jobRole || ''}
  //               onChange={onChange}
  //               className={
  //                 errors.jobRole
  //                   ? 'border-red-500 focus-visible:ring-red-500'
  //                   : ''
  //               }
  //             />
  //             {errors.jobRole && (
  //               <p className="text-[10px] text-red-500 mt-1">
  //                 {errors.jobRole}
  //               </p>
  //             )}
  //           </div>

  //           {/* Location */}
  //           <div>
  //             <label className="text-xs font-bold uppercase text-gray-500">
  //               Location
  //             </label>
  //             <Input
  //               name="location"
  //               value={localFormData.location || ''}
  //               onChange={onChange}
  //               className={
  //                 errors.location
  //                   ? 'border-red-500 focus-visible:ring-red-500'
  //                   : ''
  //               }
  //             />
  //             {errors.location && (
  //               <p className="text-[10px] text-red-500 mt-1">
  //                 {errors.location}
  //               </p>
  //             )}
  //           </div>
  //         </form>
  //         <DialogFooter className="mt-6 gap-2">
  //           <Button
  //             disabled={isLoading}
  //             variant="outline"
  //             onClick={handleCancel}
  //           >
  //             Cancel
  //           </Button>
  //           <Button onClick={handleSave} disabled={isLoading}>
  //             {isLoading ? (
  //               <Loader2 className=" h-4 w-4 animate-spin" />
  //             ) : (
  //               'Save Changes'
  //             )}
  //           </Button>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>
  //   </aside>
  // );

  return (
    <aside className="w-full lg:w-80 space-y-5 pl-2  max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* --- PROFILE CARD --- */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm">
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-500 text-white text-3xl font-bold overflow-hidden shadow-inner ring-4 ring-blue-50">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover h-full w-full"
              />
            ) : (
              getInitials(profile.fullName)
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {profile.fullName || 'Your Name'}
        </h2>

        {profile.jobRole && (
          <p className="text-blue-600 font-medium text-[15px] mt-1">
            {profile.jobRole}
          </p>
        )}

        <div className="space-y-2 mt-4 text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 bg-gray-50 py-1.5 px-3 rounded-md border border-gray-100">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate max-w-[200px]">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => setLocalIsModalOpen(true)}
          variant="outline"
          className="mt-6 w-full gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Edit size={16} /> Edit Profile
        </Button>

        <Button
          onClick={handleLinkedInImport}
          variant="outline"
          disabled={isLinkedInConnecting}
          className="mt-3 w-full gap-2 border-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/5 hover:text-[#0A66C2]"
        >
          {isLinkedInConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Linkedin size={16} />
              Connect Basic Profile
            </>
          )}
        </Button>

        <input
          ref={linkedInDocumentInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleLinkedInDocumentUpload}
        />

        <Button
          onClick={handleLinkedInDocumentPicker}
          variant="outline"
          disabled={isLinkedInDocumentUploading}
          className="mt-3 w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        >
          {isLinkedInDocumentUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing LinkedIn PDF...
            </>
          ) : (
            <>
              <FileText size={16} />
              Import LinkedIn PDF/Export
            </>
          )}
        </Button>

        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Connect LinkedIn for basic identity details, or upload your LinkedIn
          PDF/DOCX export to import education, experience, skills, and
          projects.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* --- CV SECTION --- */}
        <div className="p-4">
          {profile.uploadedCV ? (
            <a
              href={profile.uploadedCV}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 text-[15px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>View Current CV</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <FileText className="w-6 h-6 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">
                No CV uploaded
              </p>
            </div>
          )}
        </div>

        {/* --- UPLOAD AREA --- */}
        {!file ? (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
            className={`p-4 border-2 border-dashed m-3 rounded-xl text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[0.98]'
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileValidation(selectedFile);
                }
                e.target.value = '';
              }}
            />
            <div
              className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              <UploadCloud
                className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`}
              />
            </div>
            <p className="text-[15px] font-semibold text-gray-800 mb-1">
              {isDragging ? 'Drop it here!' : 'Upload your CV'}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Drag & drop or{' '}
              <span className="text-blue-600 font-medium">browse</span>
            </p>
            <p className="text-[11px] font-medium text-gray-400 bg-gray-100 inline-block px-2 py-0.5 rounded uppercase tracking-wider">
              PDF, DOC, DOCX
            </p>
          </div>
        ) : (
          <div className="flex flex-col p-4 bg-gradient-to-b from-blue-50/50 to-white">
            <div className="flex items-start gap-3 p-3 bg-white border border-blue-100 rounded-lg shadow-sm mb-4">
              <div className="p-2 bg-blue-50 rounded-md shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  {/* {(file.size / 1024 / 1024).toFixed(2)} MB */}
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center w-full gap-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing... {progress}%
                  </span>
                  <div className="w-full bg-blue-800/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                'Process CV'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      <Dialog open={localIsModalOpen} onOpenChange={setLocalIsModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 sm:p-8 rounded-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          {/* Avatar Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-500 text-white text-3xl font-bold overflow-hidden shadow-sm ring-4 ring-blue-50 transition-all group-hover:ring-blue-100">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  getInitials(profile.fullName)
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full cursor-pointer shadow-md hover:scale-110 hover:border-blue-200 transition-all">
                <Camera className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 block">
                Full Name
              </label>
              <Input
                name="fullName"
                value={localFormData.fullName || ''}
                onChange={onChange}
                className={`bg-gray-50 border-gray-200 focus:bg-white ${
                  errors.fullName
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="e.g. Jane Doe"
              />
              {errors.fullName && (
                <p className="text-[11px] font-medium text-red-500 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 block">
                Phone
              </label>
              <div
                className={`${errors.phone ? 'ring-1 ring-red-500 rounded-md' : ''}`}
              >
                <SimplePhoneInput
                  value={localFormData.phone || ''}
                  onChange={(phone) =>
                    setLocalFormData((prev) => ({ ...prev, phone }))
                  }
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-medium text-red-500 mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 block">
                Job Role
              </label>
              <Input
                name="jobRole"
                value={localFormData.jobRole || ''}
                onChange={onChange}
                className={`bg-gray-50 border-gray-200 focus:bg-white ${
                  errors.jobRole
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="e.g. Frontend Developer"
              />
              {errors.jobRole && (
                <p className="text-[11px] font-medium text-red-500 mt-1">
                  {errors.jobRole}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 block">
                Location
              </label>
              <Input
                name="location"
                value={localFormData.location || ''}
                onChange={onChange}
                className={`bg-gray-50 border-gray-200 focus:bg-white ${
                  errors.location
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="e.g. New York, USA"
              />
              {errors.location && (
                <p className="text-[11px] font-medium text-red-500 mt-1">
                  {errors.location}
                </p>
              )}
            </div>
          </form>

          <DialogFooter className="mt-8 gap-3 sm:gap-2">
            <Button
              disabled={isLoading}
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default SideSectionProfile;
