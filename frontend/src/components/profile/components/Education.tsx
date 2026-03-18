'use client';

import React, { useState } from 'react';
import {
  Award,
  Calendar,
  GraduationCap,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
  Loader2,
} from 'lucide-react';

import { useEducation } from '@/hooks/useProfile';
import { AddEducation } from '../AddEducation';
import ModalPortal from '@/components/ui/modalPortal';
import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

const formatDateForMonthInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleString('default', {
    month: 'short',
  })} ${d.getFullYear()}`;
};

const Education = () => {
  const { educations, deleteEducation, loading } = useEducation();

  // modal state (LOCAL, correct place)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl flex font-bold gap-2 text-gray-800">
            Education : {educations.length}
            <span>
              {' '}
              {loading && (
                <Loader2 className="animate-spin transition duration-500" />
              )}
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add
        </button>
      </div>

      {/* List */}
      <div className="rounded-lg p-2 max-h-[70vh] overflow-y-auto">
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-4">
          {loading && educations.length === 0 ? (
            <ProfileGridSkeleton count={6} />
          ) : educations.length > 0 ? (
            educations.map((edu, index) => (
              <div key={edu._id} className="bg-white rounded-lg p-4 border ">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                      <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
                        {index + 1}.
                      </span>
                      {edu.degree}
                    </h4>
                    <p className="text-blue-600 font-medium break-all ">
                      {edu.institute}
                    </p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-gray-500 mt-1 break-all line-clamp-1">
                        Field: {edu.fieldOfStudy}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditData(edu)}
                      className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(edu._id)}
                      className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatDateForMonthInput(edu.startDate)} to{' '}
                      {/* {formatDateForMonthInput(edu.endDate) || 'Present'} */}
                      {/* {edu.isCurrent */}
                      {(edu.isCurrentlyStudying ?? edu.isCurrent)
                        ? 'Present'
                        : formatDateForMonthInput(edu.endDate) || 'Present'}
                    </span>
                  </div>

                  {edu.gpa && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>GPA: {edu.gpa}</span>
                    </div>
                  )}

                  {edu.country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{edu.country}</span>
                    </div>
                  )}
                  {edu.grade && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>Percentage/CGPA: {edu.grade}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No education added</div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && <AddEducation onCancel={() => setIsAddOpen(false)} />}

      {/* EDIT MODAL */}
      {editData && (
        <AddEducation
          isEdit
          data={editData}
          onCancel={() => setEditData(null)}
        />
      )}

      {/* DELETE CONFIRM */}

      <ModalPortal>
        {deleteId && (
          <div className="fixed inset-0 z-[50] bg-black/40 flex items-center justify-center ">
            <div className="bg-white p-6 rounded-lg w-80">
              <p className="text-gray-800 mb-4">
                Are you sure you want to delete this education?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteEducation(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};

export default Education;
