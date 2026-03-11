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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logoutRequest } from '@/redux/reducers/authReducer';
import { Loader } from '@/components/Loader';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

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
  const router = useRouter();

  // --- NEW: Account Mismatch State ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const urlEmail = searchParams.get('email');

  // --- NEW: Check Email Match ---
  useEffect(() => {
    if (user && user.email && urlEmail) {
      if (user.email !== urlEmail) {
        setShowLogoutModal(true);
      }
    }
  }, [user, urlEmail]);

  // --- NEW: Handle Logout ---
  const handleLogoutConfirm = () => {
    try {
      // remove feedback session token
      sessionStorage.removeItem('feedback_shown');
      dispatch(logoutRequest());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
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
              cv: cvData.cv || cvData.html || '',
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

              coverLetter: app.tailoredCoverLetter.html || '',
              email: app.applicationEmail.html || '',
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
        setError(
          `${err?.response?.data?.error}\nUnable to load the document. Please try again later.`,
        );
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

  const handleSendEmail = async (
    recruiterEmail: string,
    options?: { mode?: 'cv' | 'cl' | 'tailored' },
  ) => {
    const mode = options?.mode ?? 'tailored';
    let bodyHtml = '';
    let htmlResume = '';
    let htmlCoverLetter = '';

    if (mode === 'cv') {
      bodyHtml = 'Please find my CV attached.';
      htmlResume = documentData?.cv || '';
    } else if (mode === 'cl') {
      bodyHtml = 'Please find my cover letter attached.';
      htmlCoverLetter = documentData?.content || '';
    } else {
      bodyHtml = documentData?.email || 'Please find my CV and cover letter attached.';
      htmlResume = documentData?.cv || '';
      htmlCoverLetter = documentData?.coverLetter || '';
    }

    await apiInstance.post('/user/send-email', {
      subject: documentData?.jobTitle || 'Job Application',
      bodyHtml,
      htmlResume,
      htmlCoverLetter,
      recruiterEmail,
    });

    toast({ title: 'Email sent successfully' });
  };

  // --- Modal UI ---
  // if (showLogoutModal) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  //       <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">
  //           Account Mismatch
  //         </h2>
  //         <p className="text-gray-600 mb-6">
  //           You are currently logged in as <strong>{user?.email}</strong>, but
  //           this link is intended for <strong>{urlEmail}</strong>.
  //           <br />
  //           <br />
  //           Would you like to logout of your current account?
  //         </p>
  //         <div className="flex justify-end gap-3">
  //           <button
  // onClick={() => {
  //   setShowLogoutModal(false);
  //   router.replace('/dashboard/my-docs');
  // }}
  //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
  //           >
  //             No, Stay here
  //           </button>
  //           <button
  //             onClick={handleLogoutConfirm}
  //             className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
  //           >
  //             Yes, Logout
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // --- NEW: Modal UI (Production Ready) ---
  if (showLogoutModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Switch Account Required
          </h2>
          <p className="text-gray-600 mb-6">
            This document belongs to <strong>{urlEmail}</strong>, but you are
            currently signed in as <strong>{user?.email}</strong>.
            <br />
            <br />
            To access this document, you need to switch to the correct account.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowLogoutModal(false);
                router.replace('/dashboard/my-docs');
                setIsLoading(true);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              No, Stay here
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 "
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Loader
        imageClassName="w-6 h-6"
        textClassName="text-sm"
        classStyle="min-h-screen -mt-16"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in duration-300">
          {/* Icon with a soft background pulse */}
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20"></div>
            <AlertTriangle className="w-10 h-10 text-red-500 relative z-10" />
          </div>

          {/* Error Text Section */}
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Content Unavailable
          </h2>

          <div className="bg-red-50/50 rounded-lg p-4 border border-red-100/50">
            <p className="text-red-600 font-medium whitespace-pre-line leading-relaxed">
              {error}
            </p>
          </div>

          <p className="mt-6 text-slate-500 text-sm">
            If this persists, please contact support or check your connection.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 bg-buttonPrimary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ---------------- RENDER ----------------
  switch (type) {
    case 'cv':
      return (
        <GeneratedCV
          generatedCvOutput={documentData}
          onSendEmail={(email: string) => handleSendEmail(email, { mode: 'cv' })}
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
          onSendEmail={(email: string) => handleSendEmail(email, { mode: 'cl' })}
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
