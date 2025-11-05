'use client';

import GeneratedCV from '@/components/cv/GeneratedCV';
import apiInstance from '@/services/api';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import GeneratedCoverLetter from '@/components/cover-letter/components/GeneratedCoverLetter';
import ResultStep from '@/components/application/applications/wizard/steps/result/ResultStep';
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useDispatch } from 'react-redux';
import { savedStudentResumeRequest } from '@/redux/reducers/aiReducer';
import { useSearchParams } from 'next/navigation';

const DocumentPage = () => {
  const { type, id } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state: RootState) => state.auth);

  // CV Save States
  const [activeCvToSave, setActiveCvToSave] = useState(null);
  const [cvNameForSavingInput, setCvNameForSavingInput] = useState('');

  // Cover Letter Save States
  const [activeLetterToSave, setActiveLetterToSave] = useState(null);
  const [letterNameForSavingInput, setLetterNameForSavingInput] = useState('');

  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [saveType, setSaveType] = useState(''); // 'cv' or 'cl'

  const [refinedCv, setRefinedCv] = useState('');
  const [tailoredCl, setTailoredCl] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const query = searchParams.get('q');

        let endpoint = '';
        let responseData = null;

        // Determine the API endpoint based on document type
        switch (type) {
          case 'cv':
            query === 'saved'
              ? (endpoint = `/students/resume/saved/${id}`)
              : (endpoint = `/students/cv/${id}`);
            break;
          case 'cl':
            query === 'saved'
              ? (endpoint = `/students/letter/saved/${id}`)
              : (endpoint = `/students/cl/${id}`);
            // endpoint = `/students/cl/${id}`;
            break;
          case 'application':
            endpoint = `/students/tailored-application/${id}`;
            break;
          default:
            throw new Error('Invalid document type');
        }

        const response = await apiInstance.get(endpoint);

        responseData = response.data;

        let transformedData;
        switch (type) {
          case 'cv':
            transformedData = {
              atsScore:
                responseData?.cv?.cvData.atsScore || responseData.html.ats,
              cv: responseData?.cv?.cvData.cv || responseData.html.html,
              type: 'cv',
              ...responseData.cv,
            };

            break;
          case 'cl':
            transformedData = {
              content:
                responseData.cl?.clData?.html ||
                responseData.html.coverLetter ||
                '',
              type: 'cl',
              ...responseData.coverLetter,
            };
            break;
          case 'application':
            transformedData = {
              cv: responseData.application?.tailoredCV || '',
              coverLetter: responseData.application?.tailoredCoverLetter || '',
              email: responseData.application?.applicationEmail || '',
              jobTitle: responseData.application?.jobTitle || '',
              discription: responseData.application?.jobDescription || '',
              type: 'application',
              ...responseData.application,
            };

            // Set the application content for ResultStep
            setRefinedCv(responseData.application?.tailoredCV || '');
            setTailoredCl(responseData.application?.tailoredCoverLetter || '');
            setEmailDraft(responseData.application?.applicationEmail || '');
            break;
          default:
            transformedData = responseData;
        }

        setDocumentData(transformedData);
      } catch (error) {
        console.error('Error fetching document data:', error);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) {
      fetchData();
    }
  }, [type, id]);

  // CV Save Functions
  const confirmSaveNamedCv = async () => {
    if (!cvNameForSavingInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'CV name cannot be empty.',
      });
      return;
    }
    try {
      await apiInstance.post('/students/resume/save/html', {
        title: cvNameForSavingInput,
        html: documentData?.cv,
        ats: documentData?.atsScore,
      });
      toast({ title: 'CV Saved Successfully!' });
      dispatch(savedStudentResumeRequest());
    } catch (error) {
      console.error('Error saving CV:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the CV.',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setActiveCvToSave(null);
      setCvNameForSavingInput('');
      setSaveType('');
    }
  };

  const handleInitiateCvSave = () => {
    if (!documentData?.cv) {
      toast({ variant: 'destructive', title: 'No CV to Save' });
      return;
    }
    setActiveCvToSave(documentData);
    setCvNameForSavingInput(`CV for ${documentData.jobTitle || 'Job'}`);
    setSaveType('cv');
    setIsNamingDialogDisplayed(true);
  };

  // Cover Letter Save Functions
  const confirmSaveNamedCl = async () => {
    if (!letterNameForSavingInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'Cover letter name cannot be empty.',
      });
      return;
    }
    try {
      await apiInstance.post('/students/letter/save/html', {
        title: letterNameForSavingInput,
        html: documentData?.content,
      });
      toast({ title: 'Cover Letter Saved Successfully!' });
      // dispatch(savedStudentCoverLetterRequest());
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the cover letter.',
      });
    } finally {
      setIsNamingDialogDisplayed(false);
      setActiveLetterToSave(null);
      setLetterNameForSavingInput('');
      setSaveType('');
    }
  };

  const handleInitiateClSave = () => {
    const contentToSave = documentData?.content;

    if (!contentToSave) {
      toast({ variant: 'destructive', title: 'No Cover Letter to Save' });
      return;
    }

    setActiveLetterToSave(contentToSave);
    setLetterNameForSavingInput(
      `Cover Letter for ${documentData.jobTitle || 'Job'}`,
    );
    setSaveType('cl');
    setIsNamingDialogDisplayed(true);
  };

  // Unified confirm function that routes to the correct save function
  const handleConfirmSave = () => {
    if (saveType === 'cv') {
      confirmSaveNamedCv();
    } else if (saveType === 'cl') {
      confirmSaveNamedCl();
    }
  };

  const handleRegenerate = async () => {
    try {
      console.log('Regenerating application');
      // Implement your regenerate logic here
    } catch (error) {
      console.error('Error regenerating application:', error);
    }
  };

  const handleSendEmail = () => {
    const response = apiInstance.post('/user/send-email', {
      senderEmail: user?.email,
      recieverEmail: 'infozobsai@gmail.com',
      subject: documentData?.jobTitle,
      bodyHtml: documentData?.email,
      htmlResume: documentData?.cv,
      htmlCoverLetter: documentData?.coverLetter,
    });

    toast({
      title: 'Email Sent',
      description: 'An email has been sent to your linked account.',
    });
  };

  const handleStartNew = () => {
    console.log('Starting new application...');
    // Navigate to new application or reset state
  };

  const handleSaveAndFinish = () => {
    console.log('Saving and finishing application...');
    // Implement save and finish logic
  };

  const setWizardStep = (step: string) => {
    console.log('Setting wizard step to:', step);
    // Handle wizard step navigation if needed
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render different components based on document type
  const renderDocument = () => {
    if (!documentData) return null;

    switch (type) {
      case 'cv':
        return (
          <GeneratedCV
            generatedCvOutput={documentData}
            handleInitiateSave={handleInitiateCvSave}
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
            setGeneratedLetter={() => {}} // Add empty function if needed
            handleInitiateSave={handleInitiateClSave}
            handleRegenerate={handleRegenerate}
            isNamingDialogDisplayed={isNamingDialogDisplayed}
            setIsNamingDialogDisplayed={setIsNamingDialogDisplayed}
            cvNameForSavingInput={letterNameForSavingInput}
            setCvNameForSavingInput={setLetterNameForSavingInput}
            confirmSaveNamedCv={handleConfirmSave}
          />
        );
      case 'application':
        // Create jobContext object from application data
        const jobContext = {
          jobTitle: documentData.jobTitle || '',
          companyName: documentData.companyName || '',
          jobDescription: documentData.jobDescription || '',
        };

        return (
          <ResultStep
            jobContext={jobContext}
            refinedCv={refinedCv}
            setRefinedCv={setRefinedCv}
            tailoredCl={tailoredCl}
            setTailoredCl={setTailoredCl}
            emailDraft={emailDraft}
            setEmailDraft={setEmailDraft}
            setWizardStep={setWizardStep}
            handleSendEmail={handleSendEmail}
            handleStartNew={handleStartNew}
            handleSaveAndFinish={handleSaveAndFinish}
          />
        );
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Unknown document type</p>
            </div>
          </div>
        );
    }
  };

  return <div>{renderDocument()}</div>;
};

export default DocumentPage;
