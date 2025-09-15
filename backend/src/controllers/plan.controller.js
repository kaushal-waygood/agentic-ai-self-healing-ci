/** @format */
import { Plan } from '../models/Plans.model.js'; // Adjust path
import mongoose from 'mongoose';

export const createPlan = async (req, res) => {
  try {
    const { planType, billingVariants, displayOrder } = req.body;

    if (!planType || !billingVariants || !displayOrder) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: planType, displayOrder, and billingVariants are required.',
      });
    }

    const existingPlanType = await Plan.findOne({ planType });
    if (existingPlanType) {
      return res.status(409).json({
        success: false,
        message: `A plan with planType '${planType}' already exists.`,
        existingPlan: existingPlanType,
      });
    }

    const existingDisplayOrder = await Plan.findOne({ displayOrder });
    if (existingDisplayOrder) {
      return res.status(409).json({
        success: false,
        message: `A plan with displayOrder '${displayOrder}' already exists.`,
        existingPlan: existingDisplayOrder,
      });
    }

    const newPlan = await Plan.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully.',
      data: newPlan,
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.code === 11000) {
      if (error.keyPattern?.planType) {
        return res.status(409).json({
          success: false,
          message: `A plan with planType '${req.body.planType}' already exists.`,
        });
      }
      if (error.keyPattern?.displayOrder) {
        return res.status(409).json({
          success: false,
          message: `A plan with displayOrder '${req.body.displayOrder}' already exists.`,
        });
      }
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please check your input data.',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const cleanupIndexes = async (req, res) => {
  try {
    const indexes = await Plan.collection.getIndexes();
    console.log('Current indexes:', indexes);

    // Check if name_1 index exists
    if (indexes.name_1) {
      await Plan.collection.dropIndex('name_1');
      return res.status(200).json({
        success: true,
        message: 'Removed old name_1 index successfully',
        indexes: await Plan.collection.getIndexes(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'No name_1 index found',
      indexes: indexes,
    });
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up indexes',
      error: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Plan ID.' });
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No update data provided.' });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully.',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A plan with that 'planType' or 'displayOrder' already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please check your input data.',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      message: 'Plans fetched successfully.',
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};
