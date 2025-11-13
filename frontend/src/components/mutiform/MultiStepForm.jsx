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
import Image from 'next/image';
import {
  createAutopilotRequest,
  getAutopilotRequest,
} from '@/redux/reducers/autopilotReducer';

import AgentPreviewModal from './AgentPreviewModal'; // NEW FILE (see below)

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
    country: '',
    isRemote: false,
    employmentTypes: [],
    cvFile: null,
    coverLetterStrategy: 'generate',
    coverLetterInstructions: '',
    maxApplications: 1,
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

  // const handleDeleteAgent = async (agentId) => {
  //   if (!window.confirm('Are you sure you want to delete this agent?')) return;
  //   try {
  //     await apiInstance.delete(`/pilotagent/delete/${agentId}`);
  //     setAgents(agents.filter((agent) => agent._id !== agentId));
  //     dispatch(getAutopilotRequest());
  //     alert('Agent deleted successfully.');
  //   } catch (err) {
  //     console.error(err);
  //     alert('Error deleting agent. Try again.');
  //   }
  // };
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
      submissionData.append('isRemote', String(!!formData.isRemote));
      submissionData.append(
        'maxApplications',
        String(formData.maxApplications),
      );
      submissionData.append(
        'employmentTypes',
        JSON.stringify(formData.employmentTypes || []),
      );

      if (formData.cvFile) {
        const f = formData.cvFile;
        if (f instanceof File || f instanceof Blob) {
          submissionData.append('cv', f, f.name || 'cv');
        } else if (f.__savedCvId) {
          submissionData.append('savedCvId', String(f.__savedCvId));
        }
      }

      if (editingAgentId) {
        await apiInstance.put(
          `/pilotagent/update/${editingAgentId}`,
          submissionData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );
        alert('Agent updated successfully!');
        dispatch(getAutopilotRequest());
      } else {
        await apiInstance.post('/pilotagent/create', submissionData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // alert('Agent created successfully!');

        dispatch(getAutopilotRequest());
      }

      setEditingAgentId(null);
      setFormData(initialFormData);
      setStep(0);
    } catch (err) {
      console.error('Submit error:', err);
      alert('There was an error saving the agent.');
      setStep(0);
    }
  };

  useEffect(() => {
    dispatch(getAutopilotRequest());
  }, [dispatch]);

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
            values={formData}
          />
        );
      case 4:
        return (
          <Step4ConfigureSave
            prevStep={prevStep}
            nextStep={nextStep}
            handleChange={handleChange}
            handleSubmit={handlePreview} // CHANGED
            values={formData}
          />
        );

      case 5:
        return (
          <div className="flex items-center flex-col justify-center min-h-screen">
            <div>
              <Image
                src="/logo.png"
                alt="zobsai logo"
                width={100}
                height={100}
                className="w-10 h-10 animate-bounce"
              />
            </div>
            <div className="text-lg">Generating agent Please wait...</div>
          </div>
        );
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
          nextStep={nextStep}
          onCancel={() => setIsPreviewOpen(false)}
          onConfirm={confirmSubmit}
        />
      )}
    </div>
  );
};

export default MultiStepForm;
