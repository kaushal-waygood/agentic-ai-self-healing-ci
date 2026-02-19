'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { findSingleJobRequest } from '@/redux/reducers/jobReducer';
import {
  getStudentDetailsRequest,
  getStudentEventsRequest,
} from '@/redux/reducers/studentReducer';
import {
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';

import { RootState } from '@/redux/rootReducer';
import { DocumentSelection } from './DocumentSelection';
import { ReviewAndApply } from './ReviewAndApply';
import { toast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { set } from 'lodash';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { job, loading } = useSelector((state: RootState) => state.jobs);
  const { students } = useSelector((state: RootState) => state.student);
  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isApplying, setIsApplying] = useState(false); // 1. Add this state

  /* ---------------- Resume state ---------------- */
  const [resumeChoice, setResumeChoice] = useState<'saved' | 'upload'>('saved');
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<
    string | null
  >(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  /* -------------- Cover letter state ------------- */
  const [coverLetterChoice, setCoverLetterChoice] = useState<
    'saved' | 'upload'
  >('saved');
  const [selectedSavedClId, setSelectedSavedClId] = useState<string | null>(
    null,
  );
  const [clFile, setClFile] = useState<File | null>(null);
  const [clError, setClError] = useState<string | null>(null);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    if (jobId) dispatch(findSingleJobRequest(jobId as string));
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
    dispatch(savedStudentCoverLetterRequest());
  }, [jobId, dispatch]);

  /* ---------------- Validation ---------------- */
  const validateAndProceed = () => {
    if (job?.resumeRequired) {
      if (resumeChoice === 'upload' && !cvFile) {
        setCvError('Please upload a resume.');
        return;
      }

      if (resumeChoice === 'saved' && !selectedSavedResumeId) {
        setCvError('Please select a resume.');
        return;
      }
    }

    setCvError(null);
    setStep(2);
  };

  /* ---------------- File handling ---------------- */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type.');
      return;
    }

    setError(null);
    setFile(file);
  };

  /* ---------------- Screening answers ---------------- */
  const handleAnswerChange = (id: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /* ---------------- Apply ---------------- */
  const handleApply = async () => {
    setIsApplying(true);
    try {
      const formData = new FormData();
      const formattedAnswers = Object.entries(answers).map(([id, value]) => ({
        [id]: value,
      }));

      formData.append('answers', JSON.stringify(formattedAnswers));
      if (resumeChoice === 'saved' && selectedSavedResumeId) {
        formData.append('resumeId', selectedSavedResumeId);
      }

      if (resumeChoice === 'upload' && cvFile) {
        formData.append('cv', cvFile);
      }

      // Cover letter
      if (coverLetterChoice === 'saved' && selectedSavedClId) {
        formData.append('coverLetterId', selectedSavedClId);
      }

      if (coverLetterChoice === 'upload' && clFile) {
        formData.append('coverLetter', clFile);
      }

      await apiInstance.post(`/jobs/${job._id}/apply`, formData);
      const response = await apiInstance.get(
        '/students/jobs/events?type=APPLIED',
      );
      router.replace('/dashboard/search-jobs');

      toast({
        title: 'Success',
        description: 'Your application has been submitted successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Application failed.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading || !job) {
    return <div className="text-center py-24">Loading...</div>;
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-4xl mx-auto py-12">
      <section className="rounded-lg bg-white border p-2 md:p-6">
        {step === 1 ? (
          <DocumentSelection
            job={job}
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
            coverLetter={coverLetter}
            coverLetterChoice={coverLetterChoice}
            setCoverLetterChoice={setCoverLetterChoice}
            selectedSavedClId={selectedSavedClId}
            setSelectedSavedClId={setSelectedSavedClId}
            clFile={clFile}
            clError={clError}
            setClFile={setClFile}
            setClError={setClError}
            savedCoverLetterUrl={students?.[0]?.student?.coverLetterUrl}
            onNext={validateAndProceed}
          />
        ) : (
          <ReviewAndApply
            isApplying={isApplying}
            job={job}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            resumeChoice={resumeChoice}
            selectedResume={resume?.html?.find(
              (r: any) => r._id === selectedSavedResumeId,
            )}
            cvFile={cvFile}
            coverLetterChoice={coverLetterChoice}
            selectedCoverLetter={coverLetter?.html?.find(
              (c: any) => c._id === selectedSavedClId,
            )}
            clFile={clFile}
            onBack={() => setStep(1)}
            handleApply={handleApply}
          />
        )}
      </section>
    </div>
  );
};

export default JobDetailPage;
