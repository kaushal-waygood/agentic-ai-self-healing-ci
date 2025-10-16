import { Edit, File, Sparkles, UploadCloud, X } from 'lucide-react';
import React from 'react';
const dummyUser = {
  name: 'Alex Rider',
  email: 'alex.rider@example.com',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
  memberSince: 'October 2024',
  totalOrders: 12,
  totalSpent: 24567,
  rewardPoints: 450,
};
const SideSectionProfile = ({
  personalInfoForm,
  fileInputRef,
  file,
  isDragging,
  isUploading,
  handleFileChange,
  handleButtonClick,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleRemoveFile,
  handleUpload,
}: any) => {
  const { fullName, email, phone } = personalInfoForm.control._formValues;

  return (
    <div>
      <aside className=" w-full lg:w-80 space-y-5">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

          <div className="relative bg-white p-8 border border-gray-200 rounded-3xl shadow-lg ">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
                <img
                  src={dummyUser.avatar}
                  alt="Avatar"
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Edit size={14} />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {fullName}
              </h2>
              <p className="text-sm text-gray-600 ">{email}</p>
              <p className="text-sm text-gray-600 ">{phone}</p>

              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
            <Award size={16} />
            <span>{dummyUser.rewardPoints} Points</span>
          </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-black text-blue-600">
                  {dummyUser.totalOrders}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Orders
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-2xl font-black text-purple-600">
                  ₹{(dummyUser.totalSpent / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Spent
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-lg">
            <div className="text-center mb-6">
              {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4">
                <UploadCloud className="h-8 w-8 text-white" />
              </div> */}
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
                    <File className="w-6 h-6 text-blue-600" />
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
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Process CV
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideSectionProfile;
