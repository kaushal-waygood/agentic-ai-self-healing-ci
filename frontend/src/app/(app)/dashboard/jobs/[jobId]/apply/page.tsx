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
  const { job, loading, error } = useSelector((state: RootState) => state.jobs);
  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const [step, setStep] = useState(1);
  const [resumeChoice, setResumeChoice] = useState<'saved' | 'upload'>('saved');
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<
    string | null
  >(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [coverLetterChoice, setCoverLetterChoice] = useState<
    'saved' | 'upload'
  >('saved');
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
      if (resumeChoice === 'upload' && !cvFile)
        return setCvError('Please upload a resume.');
      if (resumeChoice === 'saved' && !selectedSavedResumeId)
        return setCvError('Please select a resume.');
    }
    setCvError(null);
    setStep(2);
  };

  console.log('resume', resume);
  console.log('coverLetter', coverLetter);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: any,
    setError: any,
  ) => {
    const file = e.target.files?.[0];
    if (file && ['application/pdf', 'application/msword'].includes(file.type)) {
      setError(null);
      setFile(file);
    } else {
      setError('Invalid file type.');
    }
  };

  if (loading || !job)
    return <div className="text-center py-24">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />

      {/* Job Header and Description omitted for brevity, same as your original code */}

      <section className="rounded-2xl bg-white border p-6">
        {step === 1 ? (
          <DocumentSelection
            {...{
              resume,
              resumeChoice,
              setResumeChoice,
              selectedSavedResumeId,
              setSelectedSavedResumeId,
              cvFile,
              cvError,
              handleFileChange,
              setCvFile,
              setCvError,
              job,
              coverLetter,
              coverLetterChoice,
              setCoverLetterChoice,
              clFile,
              clError,
              setClFile,
              setClError,
            }}
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
            onBack={() => setStep(1)}
          />
        )}
      </section>
    </div>
  );
};

export default JobDetailPage;
