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

import AgentPreviewModal from './AgentPreviewModal'; // NEW FILE (see below)
import GeneratingAgent from './step5GeneratingAgent';

const MultiStepForm = () => {
  const [step, setStep] = useState(0);
  const [agents, setAgents] = useState([]);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // NEW

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
    cvFile: null,
    coverLetterStrategy: 'generate',
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
    setFormData((prev) => ({ ...prev, cvFile: file }));
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

  // 🔸 Instead of immediately saving, open preview modal
  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // 🔸 The real submit logic happens after confirmation
  const confirmSubmit = async () => {
    setIsPreviewOpen(false);
    try {
      const submissionData = new FormData();

      submissionData.append('agentName', formData.agentName);
      submissionData.append('jobTitle', formData.jobTitle);
      submissionData.append('country', formData.country);
      submissionData.append('isRemote', String(formData.isRemote));
      submissionData.append(
        'employmentTypes',
        JSON.stringify(formData.employmentTypes),
      );
      submissionData.append(
        'maxApplications',
        String(formData.maxApplications),
      );

      submissionData.append(
        'keywords',
        JSON.stringify(formData.keywords || []),
      ); // <-- fixed

      if (formData.cvFile instanceof File)
        submissionData.append('cv', formData.cvFile);

      await apiInstance.post('/pilotagent/create', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(getAutopilotRequest());
      setFormData(initialFormData);
      setStep(0);
    } catch (err) {
      console.error(err);
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
            values={formData}
          />
        );
      case 3:
        return (
          <Step3CoverLetter
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            handleSubmit={handlePreview}
            values={formData}
          />
        );
      case 4:
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
