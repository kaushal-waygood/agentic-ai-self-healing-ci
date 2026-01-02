'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Edit,
  UploadCloud,
  X,
  Sparkles,
  Camera,
  FileText,
  MapPin,
  Phone,
  Mail,
  Briefcase,
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

// const dummyAvatar =
//   'https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-701751694975293fcgzulxp2k.png';

const SideSectionProfile = () => {
  const {
    profile,
    setProfile,
    file,
    setFile,
    // uploadCV,
    // isUploading,
    // handleUpload,
    fileInputRef,
    updateProfile,
  } = useProfile();

  const [isDragging, setIsDragging] = useState(false);
  // const [isUploadingCV, setIsUploadingCV] = useState(false);

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState<string>('');

  /* -----------------------------
     Sync avatar preview
  ------------------------------ */
  useEffect(() => {
    if (profile.avatar) {
      setPreview(profile.avatar);
    }
  }, [profile.avatar]);

  /* -----------------------------
     Handlers
  ------------------------------ */
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];
    if (!img) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(img);
  };

  const dispatch = useDispatch();

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleUpload = useCallback(async () => {
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
      await new Promise((r) => setTimeout(r, 300));

      await apiInstance.post('/students/resume/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event: ProgressEvent) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            if (percent < 95) setProgress(percent);
          }
        },
      });

      if (rampTimer) {
        clearInterval(rampTimer);
        rampTimer = null;
      }

      let finishTimer: ReturnType<typeof setInterval> | null = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 100) {
              if (finishTimer) clearInterval(finishTimer);
              finishTimer = null;
              return 100;
            }
            return prev + 1;
          });
        },
        20,
      );

      dispatch(getStudentDetailsRequest());
    } catch (error) {
      if (rampTimer) clearInterval(rampTimer);
      // eslint-disable-next-line no-console
      console.error('Error uploading file:', error);
    } finally {
      setTimeout(() => {
        // setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, [file, dispatch]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragEnter = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvt, cb: (f: File) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) cb(files[0]);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';

    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  };

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <aside className="w-full lg:w-80 space-y-4 p-3 max-h-[80vh] overflow-y-auto">
      {/* ================= Profile Card ================= */}
      <div className="border rounded-lg p-3 text-center bg-white">
        {/* <img
          src={preview}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto object-cover"
        /> */}
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-blue-500 text-white text-5xl font-semibold">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(profile.fullName)
          )}
        </div>

        <h2 className="mt-2 text-lg font-semibold text-gray-900">
          {profile.fullName || 'Your Name'}
        </h2>
        <div className=" space-y-1 mt-2 ">
          <p className="text-sm   text-gray-500 flex items-center justify-center gap-2 ">
            <Mail className="w-4 h-4" />
            {profile.email}
          </p>

          {profile.phone && (
            <p className="text-sm text-gray-500 flex items-center  justify-center gap-2 ">
              <Phone className="w-4 h-4" />
              {profile.phone}
            </p>
          )}

          {profile.jobPreference && (
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 ">
              <Briefcase className="w-4 h-4" />
              {profile.jobPreference}
            </p>
          )}

          {profile.location && (
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 ">
              <MapPin className="w-4 h-4" />
              {profile.location}
            </p>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-3 w-full">
          <Edit size={16} /> Edit Profile
        </Button>
      </div>

      {/* ================= CV Section ================= */}
      <div className="border rounded-lg p-3 bg-white text-center">
        {profile.uploadedCV ? (
          <a
            href={profile.uploadedCV}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-gray-700"
          >
            <FileText className="w-5 h-5" />
            View Uploaded CV
          </a>
        ) : (
          <p className="text-sm text-gray-500">No CV uploaded</p>
        )}
      </div>

      {/* ================= Upload CV ================= */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div
        className={`relative w-full p-2 bg-white  border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-500 bg-cyan-100 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 '
        }`}
        onClick={handleButtonClick}
        // onDragEnter={handleDragEnter}
        // onDragLeave={handleDragLeave}
        // onDragOver={handleDragOver}
        // onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          <div
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDragging
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 text-cyan-600'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop your CV'}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">
              Supports PDF, DOC, DOCX, TXT
            </p>
          </div>
        </div>
      </div>

      {/* <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <UploadCloud size={16} /> Select CV
      </Button> */}

      {/* {file && (
        <div className="border rounded-lg p-3 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)}>
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>

          <Button onClick={uploadCV} disabled={isUploading} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload CV'}
          </Button>
        </div>
      )} */}

      {file && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg  border border-gray-200 w-full max-w-md">
            {/* <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div> */}
            <div className="flex-1 overflow-hidden">
              <p className="font-xs text-gray-800 ">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
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
      )}

      {/* ================= Edit Modal ================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-500 text-white text-5xl font-semibold">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.fullName)
                )}
              </div>

              {/* upload pictures  */}

              {/* <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label> */}
            </div>
          </div>

          {/* Fields */}
          <form className="space-y-2">
            <div>
              <label htmlFor="fullName" className="block mb-1 font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={onChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-1 font-medium">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={onChange}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="jobPreference" className="block mb-1 font-medium">
                Job Role
              </label>
              <Input
                id="jobPreference"
                name="jobPreference"
                value={profile.jobPreference}
                onChange={onChange}
                placeholder="Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="location" className="block mb-1 font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={profile.location}
                onChange={onChange}
                placeholder="Bangalore"
              />
            </div>
          </form>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateProfile();
                setIsModalOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default SideSectionProfile;
