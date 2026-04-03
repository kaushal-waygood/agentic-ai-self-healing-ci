'use client';
import React, { useEffect, useState } from 'react';
import Step0_Intro from './Step0_Intro';
import Step1AgentConfig from './Step1AgentConfig';
import Step2ChooseCV from './Step2ChooseCV';
import Step3CoverLetter from './Step3CoverLetter';
import Step4ConfigureSave from './Step4ConfigureSave';
import apiInstance from '@/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';

import { getAutopilotRequest } from '@/redux/reducers/autopilotReducer';

import AgentPreviewModal from './AgentPreviewModal';
import GeneratingAgent from './step5GeneratingAgent';
import FinalResultView from '../cover-letter/components/FinalResultView';
import { dispatchImprovementPopupEvent } from '@/lib/improvement-popup';

const MultiStepForm = () => {
  const [step, setStep] = useState(0);
  const [agents, setAgents] = useState([]);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState(null);
  const [incompleteProfile, setIncompleteProfile] = useState(null);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const { autopilot } = useSelector((state) => state.autopilot);
  const [deletePopup, setDeletePopup] = useState({
    open: false,
    agentId: null,
  });

  const initialFormData = {
    agentName: '',
    jobTitle: '',
    keywords: [],
    country: '',
    isRemote: false,
    employmentTypes: [],
    cvOption: 'current_profile',
    cvFile: null,
    selectedCVId: '',
    selectedCVSource: '',
    selectedCVTitle: '',
    coverLetterStrategy: 'generate',
    selectedCoverLetterId: '',
    selectedCoverLetterSource: '',
    selectedCoverLetterTitle: '',
    coverLetterInstructions: '',
    maxApplications: 5,
  };

  const [formData, setFormData] = useState(initialFormData);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (input) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [input]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const newEmploymentTypes = checked
      ? [...formData.employmentTypes, value]
      : formData.employmentTypes.filter((type) => type !== value);
    setFormData({ ...formData, employmentTypes: newEmploymentTypes });
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0] ?? null;
    setFormData((prev) => ({
      ...prev,
      cvFile: file,
      cvOption: file ? 'uploaded_pdf' : 'current_profile',
      selectedCVId: '',
      selectedCVSource: '',
      selectedCVTitle: '',
    }));
  };

  const handleCvOptionChange = (cvOption) => {
    setFormData((prev) => ({
      ...prev,
      cvOption,
      cvFile: cvOption === 'uploaded_pdf' ? prev.cvFile : null,
      selectedCVId: cvOption === 'saved_cv' ? prev.selectedCVId : '',
      selectedCVSource: cvOption === 'saved_cv' ? prev.selectedCVSource : '',
      selectedCVTitle: cvOption === 'saved_cv' ? prev.selectedCVTitle : '',
    }));
  };

  const handleSelectedCvChange = (selection) => {
    setFormData((prev) => ({
      ...prev,
      cvOption: 'saved_cv',
      cvFile: null,
      selectedCVId: selection?.id || '',
      selectedCVSource: selection?.source || '',
      selectedCVTitle: selection?.title || '',
    }));
  };

  const handleCoverLetterStrategyChange = (coverLetterStrategy) => {
    setFormData((prev) => ({
      ...prev,
      coverLetterStrategy,
      selectedCoverLetterId:
        coverLetterStrategy === 'template' ? prev.selectedCoverLetterId : '',
      selectedCoverLetterSource:
        coverLetterStrategy === 'template'
          ? prev.selectedCoverLetterSource
          : '',
      selectedCoverLetterTitle:
        coverLetterStrategy === 'template' ? prev.selectedCoverLetterTitle : '',
    }));
  };

  const handleSelectedCoverLetterChange = (selection) => {
    setFormData((prev) => ({
      ...prev,
      coverLetterStrategy: 'template',
      selectedCoverLetterId: selection?.id || '',
      selectedCoverLetterSource: selection?.source || '',
      selectedCoverLetterTitle: selection?.title || '',
    }));
  };

  const handleEditAgent = (agentId) => {
    const agentToEdit = agents.find((agent) => agent.id === agentId);
    if (agentToEdit) {
      setFormData({ ...initialFormData, ...agentToEdit });
      setEditingAgentId(agentId);
      setStep(1);
    }
  };
  const handleDeleteAgent = (agentId) => {
    setDeletePopup({ open: true, agentId });
  };
  const confirmDelete = async () => {
    const agentId = deletePopup.agentId;
    setDeletePopup({ open: false, agentId: null });

    try {
      await apiInstance.delete(`/pilotagent/delete/${agentId}`);
      setAgents((prev) => prev.filter((agent) => agent._id !== agentId));
      dispatch(getAutopilotRequest());
      toast({
        variant: 'success',
        title: 'Deleted Successfully',
        description: 'Agent deleted successfully',
      });
    } catch (err) {
      console.error(err);
      alert('Error deleting agent. Try again.');
    }
  };

  const cancelDelete = () => {
    setDeletePopup({ open: false, agentId: null });
  };
  const isUsageLimitError = (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    return (
      status === 429 || (status === 403 && data?.error === 'LIMIT_REACHED')
    );
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // const confirmSubmit = async () => {
  //   setIsPreviewOpen(false);

  //   try {
  //     const submissionData = new FormData();

  //     // 1. Basic Info
  //     submissionData.append('agentName', formData.agentName);
  //     submissionData.append('jobTitle', formData.jobTitle);
  //     submissionData.append('country', formData.country);
  //     submissionData.append('isRemote', String(formData.isRemote));

  //     // 2. Cover Letter Strategy (This was likely the missing part)
  //     submissionData.append(
  //       'coverLetterStrategy',
  //       formData.coverLetterStrategy || 'generate',
  //     );
  //     submissionData.append(
  //       'coverLetterInstructions',
  //       formData.coverLetterInstructions || '',
  //     );

  //     submissionData.append(
  //       'employmentTypes',
  //       JSON.stringify(formData.employmentTypes),
  //     );

  //     submissionData.append(
  //       'keywords',
  //       JSON.stringify(formData.keywords || []),
  //     );

  //     // 4. Numbers
  //     submissionData.append(
  //       'maxApplications',
  //       String(formData.maxApplications),
  //     );

  //     // 5. File
  //     if (formData.cvFile instanceof File) {
  //       submissionData.append('cv', formData.cvFile);
  //     }

  //     await apiInstance.post('/pilotagent/create', submissionData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });

  //     dispatch(getAutopilotRequest());
  //     setFormData(initialFormData);
  //     setStep(0);

  //     toast({
  //       variant: 'success',
  //       title: 'Success',
  //       description: 'Agent created successfully!',
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     toast({
  //       variant: 'destructive',
  //       title: 'Error',
  //       description: 'Failed to create agent. Please try again.',
  //     });
  //   }
  // };

  const confirmSubmit = async () => {
    setIsPreviewOpen(false);

    setRateLimited(false);
    setRateLimitMessage(null);
    setIncompleteProfile(null);

    try {
      const submissionData = new FormData();

      // 1. Basic Info
      submissionData.append('agentName', formData.agentName);
      submissionData.append('jobTitle', formData.jobTitle);
      submissionData.append('country', formData.country);
      submissionData.append('isRemote', String(formData.isRemote));

      // 2. Cover Letter Strategy
      submissionData.append(
        'coverLetterStrategy',
        formData.coverLetterStrategy || 'generate',
      );
      submissionData.append(
        'coverLetterInstructions',
        formData.coverLetterInstructions || '',
      );

      if (formData.coverLetterStrategy === 'template') {
        submissionData.append(
          'selectedCoverLetterId',
          formData.selectedCoverLetterId || '',
        );
        submissionData.append(
          'selectedCoverLetterSource',
          formData.selectedCoverLetterSource || '',
        );
        submissionData.append(
          'selectedCoverLetterTitle',
          formData.selectedCoverLetterTitle || '',
        );
        submissionData.append('savedClId', formData.selectedCoverLetterId || '');
      }

      // 3. Arrays/JSON
      submissionData.append(
        'employmentTypes',
        JSON.stringify(formData.employmentTypes),
      );
      submissionData.append(
        'keywords',
        JSON.stringify(formData.keywords || []),
      );

      // 4. Numbers
      submissionData.append(
        'maxApplications',
        String(formData.maxApplications),
      );

      submissionData.append(
        'cvOption',
        formData.cvOption === 'uploaded_pdf'
          ? 'uploaded_pdf'
          : formData.cvOption === 'saved_cv'
            ? 'saved_cv'
            : 'current_profile',
      );

      if (formData.cvOption === 'saved_cv') {
        submissionData.append('selectedCVId', formData.selectedCVId || '');
        submissionData.append(
          'selectedCVSource',
          formData.selectedCVSource || '',
        );
        submissionData.append('selectedCVTitle', formData.selectedCVTitle || '');
      }

      // 5. File
      if (
        formData.cvOption === 'uploaded_pdf' &&
        formData.cvFile instanceof File
      ) {
        submissionData.append('cv', formData.cvFile);
      }

      await apiInstance.post('/pilotagent/create', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(getAutopilotRequest());
      setFormData(initialFormData);
      setStep(0);

      toast({
        variant: 'success',
        title: 'Success',
        description: 'Agent created successfully!',
      });
      dispatchImprovementPopupEvent('auto_apply_success');
    } catch (error) {
      console.error(error);
      // 1. Handle Incomplete Profile (403)
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.message === 'Profile incomplete'
      ) {
        setIncompleteProfile(
          error?.response?.data?.reasons?.join(', ') ||
            'Please complete your profile to continue.',
        );
        // If you are using a wizard, you might want to move to a result/error step here:
        // setStep(FINAL_STEP);
        return;
      }
      // 2. Handle Rate Limit (429)
      if (isUsageLimitError(error)) {
        setRateLimited(true);
        setRateLimitMessage(
          error?.response?.data?.message ||
            'You have exhausted your cover letter limit.',
        );
        return;
      }
      // 3. Fallback Generic Error
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to create agent. Please try again.',
      });
    } finally {
    }
  };

  useEffect(() => {
    dispatch(getAutopilotRequest());
  }, [dispatch]);

  const updateKeywords = (array) => {
    setFormData((prev) => ({ ...prev, keywords: array }));
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step0_Intro
            confirmDelete={confirmDelete}
            cancelDelete={cancelDelete}
            deletePopup={deletePopup}
            setDeletePopup={setDeletePopup}
            nextStep={nextStep}
            agents={autopilot}
            setAgents={setAgents}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        );
      case 1:
        return (
          <Step1AgentConfig
            isEditing={!!editingAgentId}
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            updateKeywords={updateKeywords} // <-- ADDED
            values={formData}
          />
        );
      case 2:
        return (
          <Step2ChooseCV
            nextStep={nextStep}
            prevStep={prevStep}
            handleFileChange={handleFileChange}
            handleCvOptionChange={handleCvOptionChange}
            handleSelectedCvChange={handleSelectedCvChange}
            values={formData}
          />
        );

      case 3:
        return (
          <Step3CoverLetter
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            handleCoverLetterStrategyChange={handleCoverLetterStrategyChange}
            handleSelectedCoverLetterChange={handleSelectedCoverLetterChange}
            handleSubmit={handlePreview}
            values={formData}
          />
        );

      case 4:
        return (
          <FinalResultView
            incompleteProfile={incompleteProfile}
            cvlink={undefined}
            rateLimited={isRateLimited}
            rateLimitMessage={rateLimitMessage}
            planPath="/dashboard/subscriptions"
            title="AI Agent"
            targetLink="/dashboard/ai-auto-apply"
          />
        );

      case 5:
        return <GeneratingAgent />;

      default:
        return <div>Done.</div>;
    }
  };

  return (
    <div className="form-container relative">
      {renderStep()}
      {/* Preview Modal */}
      {isPreviewOpen && (
        <AgentPreviewModal
          formData={formData}
          onCancel={() => setIsPreviewOpen(false)}
          onConfirm={confirmSubmit}
          nextStep={nextStep}
        />
      )}
    </div>
  );
};

export default MultiStepForm;
