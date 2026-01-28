'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { findSingleJobRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import {
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';

// Sub-components
import { DocumentSelection } from './DocumentSelection';
import { ReviewAndApply } from './ReviewAndApply';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();

  const { students } = useSelector((state: RootState) => state.student);
  const { job, loading } = useSelector((state: RootState) => state.jobs);
  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const [step, setStep] = useState(1);

  // Resume state
  const [resumeChoice, setResumeChoice] = useState<'saved' | 'upload'>('saved');
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<
    string | null
  >(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  // Cover letter state (✅ THIS WAS MISSING)
  const [coverLetterChoice, setCoverLetterChoice] = useState<
    'saved' | 'upload'
  >('saved');
  const [selectedSavedClId, setSelectedSavedClId] = useState<string | null>(
    null,
  );
  const [clFile, setClFile] = useState<File | null>(null);
  const [clError, setClError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) dispatch(findSingleJobRequest(jobId as string));
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
    dispatch(savedStudentCoverLetterRequest());
  }, [jobId, dispatch]);

  const validateAndProceed = () => {
    if (job?.resumeRequired) {
      if (resumeChoice === 'upload' && !cvFile) {
        return setCvError('Please upload a resume.');
      }
      if (resumeChoice === 'saved' && !selectedSavedResumeId) {
        return setCvError('Please select a resume.');
      }
    }

    setCvError(null);
    setStep(2);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const file = e.target.files?.[0];
    if (file && ['application/pdf', 'application/msword'].includes(file.type)) {
      setError(null);
      setFile(file);
    } else {
      setError('Invalid file type.');
    }
  };

  if (loading || !job) {
    return <div className="text-center py-24">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto  py-12 ">
      <div className="" />

      <section className="rounded-lg bg-white border p-2 md:p-6">
        {step === 1 ? (
          <DocumentSelection
            resume={resume}
            resumeChoice={resumeChoice}
            setResumeChoice={setResumeChoice}
            selectedSavedResumeId={selectedSavedResumeId}
            setSelectedSavedResumeId={setSelectedSavedResumeId}
            cvFile={cvFile}
            cvError={cvError}
            handleFileChange={handleFileChange}
            setCvFile={setCvFile}
            setCvError={setCvError}
            job={job}
            coverLetter={coverLetter}
            selectedSavedClId={selectedSavedClId} // ✅ FIX
            setSelectedSavedClId={setSelectedSavedClId} // ✅ FIX
            coverLetterChoice={coverLetterChoice}
            setCoverLetterChoice={setCoverLetterChoice}
            clFile={clFile}
            clError={clError}
            setClFile={setClFile}
            setClError={setClError}
            savedCoverLetterUrl={students?.[0]?.student?.coverLetterUrl}
            onNext={validateAndProceed}
          />
        ) : (
          <ReviewAndApply
            job={job}
            resumeChoice={resumeChoice}
            selectedResume={resume?.html?.find(
              (r: any) => r._id === selectedSavedResumeId,
            )}
            cvFile={cvFile}
            coverLetterChoice={coverLetterChoice}
            clFile={clFile}
            // FIX: Find the actual object instead of just passing the ID
            selectedCoverLetter={coverLetter?.html?.find(
              (c: any) => c._id === selectedSavedClId,
            )}
            onBack={() => setStep(1)}
          />
        )}
      </section>
    </div>
  );
};

export default JobDetailPage;
