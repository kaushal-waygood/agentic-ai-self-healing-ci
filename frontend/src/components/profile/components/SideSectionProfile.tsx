'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

import { useProfile } from '@/hooks/useProfile';
import apiInstance from '@/services/api';
import { useDispatch } from 'react-redux';
import {
  getStudentDetailsRequest,
  getStudentEducationRequest,
} from '@/redux/reducers/studentReducer';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (localIsModalOpen) {
      setLocalFormData({ ...profile });
      setPreview(profile.avatar || '');
    }
  }, [localIsModalOpen, profile]);

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

    if (!/^\d{10}$/.test(localFormData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits.';
      isValid = false;
    }

    if (localFormData.jobRole.trim().length < 2) {
      newErrors.jobRole = 'Job Role is required.';
      isValid = false;
    } else if (localFormData.jobRole.trim().length > 30) {
      newErrors.jobRole = 'Job Role must be at least 30 characters.';
      isValid = false;
    }

    if (localFormData.location.trim().length < 2) {
      newErrors.location = 'Location is required (e.g., City, Country).';
      isValid = false;
    } else if (localFormData.location.trim().length > 30) {
      newErrors.location = 'Location must be at least 30 characters.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  return (
    <aside className="w-full lg:w-80 space-y-4 p-3 max-h-[80vh] overflow-y-auto">
      {/* Profile Card */}
      <div className="border rounded-lg p-3 text-center bg-white shadow-sm">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-blue-500 text-white text-4xl font-semibold overflow-hidden">
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

        <h2 className="mt-2 text-lg font-semibold text-gray-900">
          {profile.fullName || 'Your Name'}
        </h2>
        <div className="space-y-1 mt-2 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> {profile.email}
          </p>
          {profile.phone && (
            <p className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> {profile.phone}
            </p>
          )}
          {profile.jobRole && (
            <p className="flex items-center justify-center gap-1">
              <Briefcase className="w-4 h-4" /> {profile.jobRole}
            </p>
          )}

          {profile.location && (
            <p className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> {profile.location}
            </p>
          )}
        </div>
        <Button
          onClick={() => setLocalIsModalOpen(true)}
          className="mt-4 w-full gap-2"
        >
          <Edit size={16} /> Edit Profile
        </Button>
      </div>

      {/* CV Section */}
      <div className="border rounded-lg p-3 bg-white text-center">
        {profile.uploadedCV ? (
          <a
            href={profile.uploadedCV}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-blue-600 hover:underline"
          >
            <FileText className="w-5 h-5" /> View Current CV
          </a>
        ) : (
          <p className="text-sm text-gray-400">No CV uploaded</p>
        )}
      </div>

      {/* Upload Area */}

      {/* 1. Only show the Upload Area if NO file is selected */}
      {!file ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:bg-gray-50'
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
          <UploadCloud className="mx-auto w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium">
            {isDragging ? 'Drop it here!' : 'Drop CV here'}
          </p>
          <p className="text-xs text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, DOCX</p>
        </div>
      ) : (
        /* 2. Show the File Info / Process button if a file IS selected */
        <div className=" flex flex-col bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
          <div className="flex items-center gap-3 p-3 rounded-lg w-full max-w-md">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 break-all">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-full flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full px-3 pb-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full  font-semibold py-2 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs ">Processing... {progress}%</span>
                </>
              ) : (
                <Button className="">Process CV</Button>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={localIsModalOpen} onOpenChange={setLocalIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-500 text-white text-4xl font-semibold overflow-hidden">
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
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  // accept="image/*"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label>
            </div>
          </div>

          <form className="space-y-3">
            {/* Full Name - existing */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Full Name
              </label>
              <Input
                name="fullName"
                value={localFormData.fullName || ''}
                onChange={onChange}
                className={
                  errors.fullName
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-[10px] text-red-500 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Phone
              </label>
              <Input
                name="phone"
                value={localFormData.phone || ''}
                onChange={onChange}
                className={
                  errors.phone
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
              {errors.phone && (
                <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Job Role */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Job Role
              </label>
              <Input
                name="jobRole"
                value={localFormData.jobRole || ''}
                onChange={onChange}
                className={
                  errors.jobRole
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
              {errors.jobRole && (
                <p className="text-[10px] text-red-500 mt-1">
                  {errors.jobRole}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Location
              </label>
              <Input
                name="location"
                value={localFormData.location || ''}
                onChange={onChange}
                className={
                  errors.location
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
              {errors.location && (
                <p className="text-[10px] text-red-500 mt-1">
                  {errors.location}
                </p>
              )}
            </div>
          </form>
          <DialogFooter className="mt-6 gap-2">
            <Button
              disabled={isLoading}
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className=" h-4 w-4 animate-spin" />
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
