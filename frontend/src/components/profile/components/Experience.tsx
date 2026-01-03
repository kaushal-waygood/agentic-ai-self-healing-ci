'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import { useExperience } from '@/hooks/useProfile';
import { AddExperience } from '../AddEducation'; // adjust path
import ModalPortal from '@/components/ui/modalPortal';

const formatDateForMonthInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleString('default', {
    month: 'short',
  })} ${d.getFullYear()}`;
};

const Experience = () => {
  const { experiences, deleteExperience } = useExperience();

  // local UI state (correct place)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  console.log('edittdata', editData);
  return (
    <div>
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Experience ({experiences.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Experience
        </button>
      </div>

      {/* List */}
      <div className="p-2 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          {experiences.length > 0 ? (
            experiences.map((exp, index) => (
              <div key={exp._id} className="bg-white rounded-lg p-4 border ">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800">
                      <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
                        {index + 1}.
                      </span>
                      {exp.company}
                    </h4>
                    <p className="text-blue-600 font-medium ">
                      {exp.designation}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditData(exp)}
                      className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(exp._id)}
                      className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-gray-100 space-y-2">
                  {exp.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDateForMonthInput(exp.startDate)} to{' '}
                        {formatDateForMonthInput(exp.endDate) || 'Present'}
                      </span>
                    </div>
                    {exp.experienceYrs > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{exp.experienceYrs} years</span>
                      </div>
                    )}

                    {exp.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{exp.location}</span>
                        <BriefcaseBusiness className="h-4 w-4 text-gray-400 ml-2" />
                        <span>{exp.employmentType}</span>
                      </div>
                    )}
                  </div>

                  {/* {exp.technologies?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No experience added</div>
          )}
        </div>
      </div>

      {/* ADD */}
      {isAddOpen && <AddExperience onCancel={() => setIsAddOpen(false)} />}

      {/* EDIT */}
      {editData && (
        <AddExperience
          isEdit={true}
          data={editData}
          onCancel={() => setEditData(null)}
        />
      )}

      {/* DELETE CONFIRM */}
      <ModalPortal>
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-80">
              <p className="text-gray-800 mb-4">
                Are you sure you want to delete this experience?
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
                    deleteExperience(deleteId);
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

export default Experience;
