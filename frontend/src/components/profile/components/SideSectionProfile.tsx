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

const dummyAvatar =
  'https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-701751694975293fcgzulxp2k.png';

const SideSectionProfile = () => {
  const {
    profile,
    setProfile,
    file,
    setFile,
    uploadCV,
    isUploading,
    fileInputRef,
    updateProfile,
  } = useProfile();

  const [isDragging, setIsDragging] = useState(false);

  const [progress, setProgress] = useState(0);
  // const [isUploading, setIsUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState<string>(dummyAvatar);

  /* -----------------------------
     Sync avatar preview
  ------------------------------ */
  useEffect(() => {
    setPreview(profile.avatar || dummyAvatar);
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

    // setIsUploading(true);
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

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <aside className="w-full lg:w-80 space-y-4 p-3 max-h-[80vh] overflow-y-auto">
      {/* ================= Profile Card ================= */}
      <div className="border rounded-lg p-3 text-center bg-white">
        <img
          src={preview}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto object-cover"
        />

        <h2 className="mt-2 font-semibold text-gray-900">
          {profile.fullName || 'Your Name'}
        </h2>

        <p className="text-sm text-gray-600">{profile.email}</p>

        {profile.phone && (
          <p className="text-sm text-gray-600">{profile.phone}</p>
        )}

        {profile.jobPreference && (
          <p className="text-sm text-gray-600 mt-1">{profile.jobPreference}</p>
        )}

        {profile.location && (
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </p>
        )}

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
        className={`relative w-full h-48 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${
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
            className={`p-4 rounded-full transition-colors duration-300 ${
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-gray-800 truncate">{file.name}</p>
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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg  transition-all duration-300 text-base flex flex-col items-center justify-center gap-2"
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

      {/* ================= Edit Modal ================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src={preview}
                alt="Avatar"
                width={96}
                height={96}
                className="rounded-full object-cover border"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <Input
              name="fullName"
              value={profile.fullName}
              onChange={onChange}
              placeholder="Full Name"
            />
            <Input value={profile.email} disabled />
            <Input
              name="phone"
              value={profile.phone}
              onChange={onChange}
              placeholder="Phone"
            />
            <Input
              name="jobPreference"
              value={profile.jobPreference}
              onChange={onChange}
              placeholder="Job Role"
            />
            <Input
              name="location"
              value={profile.location}
              onChange={onChange}
              placeholder="Location"
            />
          </div>

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
