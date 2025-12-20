'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import apiInstance from '@/services/api';
import GeneratedCV from '@/components/cv/GeneratedCV';
import GeneratedCoverLetter from '@/components/cover-letter/components/GeneratedCoverLetter';
import ResultStep from '@/components/application/applications/wizard/steps/result/ResultStep';

import { toast } from '@/hooks/use-toast';
import { RootState } from '@/redux/rootReducer';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';

const DocumentPage = () => {
  const { type, id } = useParams();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const [documentData, setDocumentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // application state
  const [refinedCv, setRefinedCv] = useState('');
  const [tailoredCl, setTailoredCl] = useState('');
  const [emailDraft, setEmailDraft] = useState('');

  // save dialog state
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [saveType, setSaveType] = useState<'cv' | 'cl' | ''>('');

  const [cvNameForSavingInput, setCvNameForSavingInput] = useState('');
  const [letterNameForSavingInput, setLetterNameForSavingInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const query = searchParams.get('q');
        let endpoint = '';

        switch (type) {
          case 'cv':
            endpoint =
              query === 'saved'
                ? `/students/resume/saved/${id}`
                : `/students/cv/${id}`;
            break;

          case 'cl':
            endpoint =
              query === 'saved'
                ? `/students/letter/saved/${id}`
                : `/students/cl/${id}`;
            break;

          case 'application':
            endpoint = `/students/tailored-application/${id}`;
            break;

          default:
            throw new Error('Invalid document type');
        }

        const { data: responseData } = await apiInstance.get(endpoint);

        // ---------- NORMALIZATION LAYER ----------
        let transformed: any;

        switch (type) {
          case 'cv': {
            const cvData = responseData?.cv?.cvData || responseData?.html || {};

            transformed = {
              type: 'cv',
              cv: cvData.cv || '',
              atsScore: cvData.atsScore || 0,
              atsScoreReasoning: cvData.atsScoreReasoning || '',
              jobTitle: responseData?.cv?.jobTitle || '',
            };
            break;
          }

          case 'cl': {
            const html =
              responseData?.cl?.clData?.html ||
              responseData?.html?.coverLetter ||
              '';

            transformed = {
              type: 'cl',
              content: html,
              jobTitle: responseData?.cl?.jobTitle || '',
            };
            break;
          }

          case 'application': {
            const app = responseData.application;

            transformed = {
              type: 'application',
              jobTitle: app.jobTitle,
              companyName: app.companyName,
              jobDescription: app.jobDescription,

              cv: app.tailoredCV?.cv || '',
              atsScore: app.tailoredCV?.atsScore || 0,
              atsScoreReasoning: app.tailoredCV?.atsScoreReasoning || '',

              coverLetter: app.tailoredCoverLetter || '',
              email: app.applicationEmail || '',
            };

            setRefinedCv(transformed.cv);
            setTailoredCl(transformed.coverLetter);
            setEmailDraft(transformed.email);
            break;
          }
        }

        setDocumentData(transformed);
      } catch (err) {
        console.error(err);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) fetchData();
  }, [type, id, searchParams]);

  // ---------------- SAVE CV ----------------
  const confirmSaveNamedCv = async () => {
    if (!cvNameForSavingInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'CV name required',
      });
      return;
    }

    try {
      await apiInstance.post('/students/resume/save/html', {
        title: cvNameForSavingInput,
        html: documentData.cv,
        ats: documentData.atsScore,
      });

      toast({ title: 'CV saved successfully' });
      dispatch(savedStudentResumeRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to save CV',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setCvNameForSavingInput('');
      setSaveType('');
    }
  };

  // ---------------- SAVE CL ----------------
  const confirmSaveNamedCl = async () => {
    if (!letterNameForSavingInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Cover letter name required',
      });
      return;
    }

    try {
      await apiInstance.post('/students/letter/save/html', {
        title: letterNameForSavingInput,
        html: documentData.content,
      });

      toast({ title: 'Cover letter saved successfully' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to save cover letter',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setLetterNameForSavingInput('');
      setSaveType('');
    }
  };

  const handleConfirmSave = () => {
    if (saveType === 'cv') confirmSaveNamedCv();
    if (saveType === 'cl') confirmSaveNamedCl();
  };

  const handleSendEmail = async () => {
    await apiInstance.post('/user/send-email', {
      senderEmail: user?.email,
      recieverEmail: 'infozobsai@gmail.com',
      subject: documentData.jobTitle,
      bodyHtml: documentData.email,
      htmlResume: documentData.cv,
      htmlCoverLetter: documentData.coverLetter,
    });

    toast({
      title: 'Email sent successfully',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // ---------------- RENDER ----------------
  switch (type) {
    case 'cv':
      return (
        <GeneratedCV
          generatedCvOutput={documentData}
          handleInitiateSave={() => {
            setSaveType('cv');
            setCvNameForSavingInput(`CV for ${documentData.jobTitle || 'Job'}`);
            setIsNamingDialogDisplayed(true);
          }}
          isNamingDialogDisplayed={isNamingDialogDisplayed}
          setIsNamingDialogDisplayed={setIsNamingDialogDisplayed}
          cvNameForSavingInput={cvNameForSavingInput}
          setCvNameForSavingInput={setCvNameForSavingInput}
          confirmSaveNamedCv={handleConfirmSave}
        />
      );

    case 'cl':
      return (
        <GeneratedCoverLetter
          generatedLetter={documentData.content}
          setGeneratedLetter={() => {}}
          handleInitiateSave={() => {
            setSaveType('cl');
            setLetterNameForSavingInput(
              `Cover Letter for ${documentData.jobTitle || 'Job'}`,
            );
            setIsNamingDialogDisplayed(true);
          }}
          isNamingDialogDisplayed={isNamingDialogDisplayed}
          setIsNamingDialogDisplayed={setIsNamingDialogDisplayed}
          cvNameForSavingInput={letterNameForSavingInput}
          setCvNameForSavingInput={setLetterNameForSavingInput}
          confirmSaveNamedCv={handleConfirmSave}
        />
      );

    case 'application':
      return (
        <ResultStep
          jobContext={{
            jobTitle: documentData.jobTitle,
            companyName: documentData.companyName,
            jobDescription: documentData.jobDescription,
          }}
          refinedCv={refinedCv}
          setRefinedCv={setRefinedCv}
          tailoredCl={tailoredCl}
          setTailoredCl={setTailoredCl}
          emailDraft={emailDraft}
          setEmailDraft={setEmailDraft}
          handleSendEmail={handleSendEmail}
          setWizardStep={() => {}}
          handleStartNew={() => {}}
          handleSaveAndFinish={() => {}}
        />
      );

    default:
      return null;
  }
};

export default DocumentPage;
