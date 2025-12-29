import { JobRole } from '../models/JobRole.model.js';

export const createJobRole = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Job role name is required' });
    }

    const existingRole = await JobRole.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Job role already exists' });
    }

    const jobRole = new JobRole({ name });
    const savedJobRole = await jobRole.save();
    res.status(201).json(savedJobRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobRoles = async (req, res) => {
  try {
    const jobRoles = await JobRole.find();
    res.status(200).json(jobRoles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
