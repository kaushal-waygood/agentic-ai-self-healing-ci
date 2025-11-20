// imports
import express from 'express';
import { Student } from '../models/student.model.js';

// server/tourConfig.js (example)
export const TOUR_CONFIG = {
  dashboard: [
    {
      element: '#profile-readiness',
      popover: {
        title: 'Profile Strength',
        description: 'Your overall profile readiness score.',
        position: 'right',
      },
    },
    {
      element: '#coreToolkit-driver',
      popover: {
        title: 'Core AI Toolkit',
        description: 'Key AI tools to help your job search.',
      },
    },
  ],
  'search-jobs': [
    {
      element: '#search-bar',
      popover: {
        title: 'Search',
        description: 'Type keywords, locations or companies.',
      },
    },
    {
      element: '#filters-panel',
      popover: {
        title: 'Filters',
        description: 'Narrow results by type, experience, etc.',
      },
    },
    {
      element: '#results-list',
      popover: { title: 'Results', description: 'Browse and save jobs here.' },
    },
  ],
  'cv-generator': [
    {
      element: '#upload-cv',
      popover: {
        title: 'Upload / Use Profile',
        description: 'Upload a CV or use your profile.',
      },
    },
    {
      element: '#template-select',
      popover: { title: 'Templates', description: 'Choose a template.' },
    },
    {
      element: '#generate-cv-btn',
      popover: { title: 'Generate', description: 'Create a new CV.' },
    },
  ],
  'cover-letter-generator': [
    {
      element: '#cl-job-input',
      popover: {
        title: 'Target Job',
        description: 'Paste job description or link.',
      },
    },
    {
      element: '#cl-template',
      popover: { title: 'Templates', description: 'Choose style and tone.' },
    },
    {
      element: '#generate-cl-btn',
      popover: {
        title: 'Generate',
        description: 'Generate your cover letter.',
      },
    },
  ],
  'ai-auto-apply': [
    {
      element: '#agent-list',
      popover: {
        title: 'Agents',
        description: 'Create an auto-apply agent here.',
      },
    },
    {
      element: '#agent-settings',
      popover: {
        title: 'Settings',
        description: 'Set filters, limits, and CV choice.',
      },
    },
    {
      element: '#start-agent',
      popover: { title: 'Start', description: 'Launch agent and let it run.' },
    },
  ],
  apply: [
    {
      element: '#job-detail',
      popover: {
        title: 'Job Detail',
        description: 'See job description and requirements.',
      },
    },
    {
      element: '#apply-wizard',
      popover: {
        title: 'Apply Wizard',
        description: 'Tailor CV and cover letter for this job.',
      },
    },
    {
      element: '#submit-application',
      popover: { title: 'Submit', description: 'Send your application.' },
    },
  ],
  profile: [
    {
      element: '#profile-form',
      popover: {
        title: 'Profile',
        description: 'Edit your personal info and work history.',
      },
    },
    {
      element: '#skills-section',
      popover: { title: 'Skills', description: 'Add skills to stand out.' },
    },
    {
      element: '#job-preferences',
      popover: {
        title: 'Job Preferences',
        description: 'Set location, salary, and availability.',
      },
    },
  ],
  // For dynamic CV pages we use {idPlaceholder} in page key and CSS targets with data attributes
  'my-docs-cv': [
    {
      element: '[data-cv-action="download"]',
      popover: {
        title: 'Download CV',
        description: 'Download or export this CV.',
      },
    },
    {
      element: '[data-cv-action="edit"]',
      popover: { title: 'Edit', description: 'Edit this CV.' },
    },
    {
      element: '[data-cv-action="use"]',
      popover: {
        title: 'Use CV',
        description: 'Use this CV for applications.',
      },
    },
  ],
  'my-docs-cl': [
    {
      element: '[data-cl-action="download"]',
      popover: {
        title: 'Download CL',
        description: 'Download or export this cover letter.',
      },
    },
    {
      element: '[data-cl-action="edit"]',
      popover: { title: 'Edit', description: 'Edit this cover letter.' },
    },
    {
      element: '[data-cl-action="use"]',
      popover: {
        title: 'Use CL',
        description: 'Use this letter for applications.',
      },
    },
  ],
  settings: [
    {
      element: '#notification-settings',
      popover: {
        title: 'Notifications',
        description: 'Manage alerts and emails.',
      },
    },
    {
      element: '#privacy-settings',
      popover: { title: 'Privacy', description: 'Control profile visibility.' },
    },
  ],
};

export const getToursForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    // You may want to return only needed fields
    const student = await Student.findById(userId).select('tours').lean();
    const userTours = (student && student.tours) || {};

    // Provide the canonical tour steps from server-side config
    const tourConfig = TOUR_CONFIG;

    return res.json({ success: true, tourConfig, userTours });
  } catch (err) {
    console.error('getToursForUser error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const updateTourProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = req.params.page; // e.g., 'cv-generate'
    const { currentStep, completed } = req.body;

    if (typeof currentStep !== 'number' && typeof completed !== 'boolean') {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid payload' });
    }

    const updatePath = `tours.${page}`;
    const updateObj = {
      [updatePath]: {
        currentStep: typeof currentStep === 'number' ? currentStep : undefined,
        completed: typeof completed === 'boolean' ? completed : undefined,
        updatedAt: new Date(),
      },
    };

    // We only want to set the provided fields; use $set with object cleanup
    const cleaned = {};
    if (typeof currentStep === 'number')
      cleaned[`${updatePath}.currentStep`] = currentStep;
    if (typeof completed === 'boolean')
      cleaned[`${updatePath}.completed`] = completed;
    cleaned[`${updatePath}.updatedAt`] = new Date();

    const updated = await Student.findByIdAndUpdate(
      userId,
      { $set: cleaned },
      { new: true, runValidators: true, select: 'tours' },
    ).lean();

    // optionally clear relevant redis cache for student details if you keep one
    try {
      await redisClient.invalidateStudentCache?.(userId);
      await redisClient.del?.([`student:${userId}:details`]);
    } catch (cacheErr) {
      console.warn(
        'Failed to invalidate cache on tour update',
        cacheErr && cacheErr.message,
      );
    }

    return res.json({ success: true, tours: (updated && updated.tours) || {} });
  } catch (err) {
    console.error('updateTourProgress error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const resetTour = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = req.params.page;
    const updatePath = `tours.${page}`;

    const updated = await Student.findByIdAndUpdate(
      userId,
      { $unset: { [updatePath]: '' } },
      { new: true, select: 'tours' },
    ).lean();

    return res.json({ success: true, tours: (updated && updated.tours) || {} });
  } catch (err) {
    console.error('resetTour error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
