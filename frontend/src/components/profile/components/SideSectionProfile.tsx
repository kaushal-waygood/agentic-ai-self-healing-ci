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
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
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
      setFile(null);
    } catch (error) {
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
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
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
          // accept=".pdf,.doc,.docx"
          // onChange={(e) => {
          //   const selectedFile = e.target.files?.[0] || null;
          //   setFile(selectedFile);
          //   e.target.value = '';
          // }}

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

      {file && (
        <div className="p-2 flex flex-col bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
          <div className="flex items-center gap-3 p-3 rounded-lg  w-full max-w-md">
            <div className="flex-1 overflow-hidden">
              <p className="font-xs text-gray-800 ">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg  transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-full bg-cyan-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-yellow-600 to-blue-600 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      Processing... {progress}%
                    </div>
                  </div>
                </>
              ) : (
                <>Process CV</>
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
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Full Name
              </label>
              <Input
                name="fullName"
                value={localFormData.fullName || ''}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Phone
              </label>
              <Input
                name="phone"
                value={localFormData.phone || ''}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Job Role
              </label>
              <Input
                name="jobRole"
                value={localFormData.jobRole || ''}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Location
              </label>
              <Input
                name="location"
                value={localFormData.location || ''}
                onChange={onChange}
              />
            </div>
          </form>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              // onClick={() => setLocalIsModalOpen(false)}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
