'use client';

import React, { useEffect, useState } from 'react';
import { useCandidateStore } from '@/store/candidates';
import { useParams } from 'next/navigation';
import { Button } from '../ui/button';
import CandidateModal from './CandidateModal'; // We will create this next

const GetCandidates = () => {
  const { candidates, getCandidates } = useCandidateStore();
  const [selectedCandidate, setSelectedCandidate] = useState(null); // Track selected candidate
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getCandidates(id);
    }
  }, [id, getCandidates]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Job ID: {id}</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Candidate
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Applied On
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 text-right">
                  Resume
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.candidates?.length > 0 ? (
                candidates.candidates.map((candidate) => (
                  <tr
                    key={candidate.applicationId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {candidate.student?.fullName}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {candidate.applicationMethod} Method
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {candidate.student?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {candidate.student?.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${candidate.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(candidate.appliedAt).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={candidate.cvLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                      >
                        View CV
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCandidate(candidate)} // Pass full candidate object
                      >
                        View More
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No candidates have applied yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modal only if a candidate is selected */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default GetCandidates;
