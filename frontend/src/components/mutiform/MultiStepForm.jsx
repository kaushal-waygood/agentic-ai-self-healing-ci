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

  // --- UPDATED SUBMIT FUNCTION ---
  // --- UPDATED SUBMIT FUNCTION TO HANDLE FILE UPLOAD ---
  const handleSubmit = async () => {
    // 1. Create a FormData object to send file and text data together
    const submissionData = new FormData();

    // 2. Append all the text fields from your form
    submissionData.append('agentName', formData.agentName);
    submissionData.append('jobTitle', formData.jobTitle);
    submissionData.append('country', formData.country);
    submissionData.append('isRemote', formData.isRemote);
    submissionData.append('maxApplications', formData.maxApplications);
    // You might want to stringify arrays or objects
    submissionData.append(
      'employmentType',
      JSON.stringify(formData.employmentTypes),
    );

    // 3. Append the CV file if it exists
    if (formData.cvFile) {
      submissionData.append('cv', formData.cvFile, formData.cvFile.name);
    }

    console.log('Final Form Data Prepared for Upload:', submissionData);

    // 4. Send the data to your server endpoint (replace with your actual API)
    try {
      const response = await apiInstance.post(
        '/pilotagent/create',
        submissionData,
      );

      const data = await response.data;
      console.log('Response from backend:', data);

      // --- This is your existing logic for after a successful submission ---
      // Create a new agent object to display in the list (without the file object)
      const { cvFile, ...agentDisplayData } = formData;
      const newAgent = { ...agentDisplayData, id: Date.now() };

      alert(`Agent "${formData.agentName}" has been created successfully!`);
      setFormData(initialFormData);
      setStep(0);
    } catch (error) {
      console.error('Error uploading agent data:', error);
      alert('There was an error creating the agent. Please try again.');
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
        return <Step0_Intro nextStep={nextStep} agents={agents} />;
      case 1:
        return (
          <Step1AgentConfig
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
