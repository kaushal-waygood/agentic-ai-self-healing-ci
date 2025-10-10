'use client';

import React, { useEffect, useState } from 'react';
import Step0_Intro from './Step0_Intro';
import Step1AgentConfig from './Step1AgentConfig';
import Step2ChooseCV from './Step2ChooseCV';
import Step3CoverLetter from './Step3CoverLetter';
import Step4ConfigureSave from './Step4ConfigureSave';
import apiInstance from '@/services/api';

const MultiStepForm = () => {
  const [step, setStep] = useState(0);
  // State to hold the list of created agents
  const [agents, setAgents] = useState([]);
  const [editingAgentId, setEditingAgentId] = useState(null); // Track agent being edited

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

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        // 1. Wait for the API call to complete successfully
        await apiInstance.delete(`/pilotagent/delete/${agentId}`);

        // 2. Only update the UI state after a successful deletion
        setAgents(agents.filter((agent) => agent._id !== agentId));
        alert('Agent deleted successfully.');
      } catch (error) {
        // 3. If the API fails, show an error and do NOT change the UI
        console.error('Failed to delete agent:', error);
        alert('Error: Could not delete the agent. Please try again.');
      }
    }
  };

  const handleEditAgent = (agentId) => {
    const agentToEdit = agents.find((agent) => agent.id === agentId);
    if (agentToEdit) {
      // Merge fetched agent data with the initial state
      // This ensures all fields, especially arrays like employmentTypes, are present.
      setFormData({ ...initialFormData, ...agentToEdit });

      setEditingAgentId(agentId);
      setStep(1);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let newEmploymentTypes = [...formData.employmentTypes];
    if (checked) {
      newEmploymentTypes.push(value);
    } else {
      newEmploymentTypes = newEmploymentTypes.filter((type) => type !== value);
    }
    setFormData({ ...formData, employmentTypes: newEmploymentTypes });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cvFile: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const submissionData = new FormData();
    submissionData.append('agentName', formData.agentName);
    submissionData.append('jobTitle', formData.jobTitle);
    submissionData.append('country', formData.country);
    submissionData.append('isRemote', formData.isRemote);
    submissionData.append('maxApplications', formData.maxApplications);
    submissionData.append(
      'employmentType',
      JSON.stringify(formData.employmentTypes),
    );
    if (formData.cvFile) {
      submissionData.append('cv', formData.cvFile, formData.cvFile.name);
    }

    try {
      // --- UPDATE an existing agent ---
      if (editingAgentId) {
        const response = await apiInstance.put(
          `/pilotagent/update/${editingAgentId}`,
          submissionData,
        );
        const updatedAgent = response.data; // Assuming the API returns the updated agent

        // On successful API response, THEN update the local state
        setAgents(
          agents.map((agent) =>
            agent.id === editingAgentId ? updatedAgent : agent,
          ),
        );
        alert(`Agent "${formData.agentName}" has been updated successfully!`);
        setEditingAgentId(null);
      } else {
        const response = await apiInstance.post(
          '/pilotagent/create',
          submissionData,
        );
        const newAgent = response.data;

        // On successful API response, THEN update the local state
        setAgents((prevAgents) => [...prevAgents, newAgent]);
        alert(`Agent "${formData.agentName}" has been created successfully!`);
      }

      // Reset form and return to dashboard on success
      setFormData(initialFormData);
      setStep(0);
    } catch (error) {
      console.error('Error submitting agent data:', error);
      alert('There was an error saving the agent. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await apiInstance.get('/pilotagent/get');
        const data = await response.data;
        setAgents(data.data.autoPilot);
        console.log('Fetched agents:', data.data.autoPilot);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);

  const renderStep = () => {
    switch (step) {
      case 0:
        // Pass the agents list to the intro component
        return (
          <Step0_Intro
            nextStep={nextStep}
            agents={agents}
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
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            values={formData}
          />
        );
      default:
        return <div>Form Submitted Successfully!</div>;
    }
  };

  return <div className="form-container">{renderStep()}</div>;
};

export default MultiStepForm;
