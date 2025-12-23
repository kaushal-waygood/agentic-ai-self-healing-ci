'use client';

import React, { useState, useEffect } from 'react';
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
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <UploadCloud size={16} /> Select CV
      </Button>

      {file && (
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
