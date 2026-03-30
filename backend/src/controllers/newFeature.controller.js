import { NewFeature } from '../models/newFeature.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
  sendTemplatedNotification,
} from '../utils/notification.utils.js';

// Make the function async to use await
export const requestNewFeature = async (req, res) => {
  // Destructure 'title' and 'description' from the request body
  const { title, description } = req.body;

  const { _id: userId } = req.user;

  try {
    // Create a new NewFeature instance, mapping 'description' to the 'message' field
    const newFeature = new NewFeature({
      title: title,
      message: description,
    });

    // Await the save operation to ensure it completes before sending a response
    await newFeature.save();

    await sendTemplatedNotification(userId, 'NEW_FEATURE_REQUEST', [title]);

    const io = req.app.get('io');
    if (io) {
      io.emit('new-feature-request', {
        title: title,
        description: description,
      });
    }

    await sendRealTimeUserNotification(
      req.app.get('io'),
      userId,
      notificationTemplates.NEW_FEATURE_REQUEST(title),
    );

    res.status(200).json({ message: 'Feature request submitted successfully' });
  } catch (error) {
    // The catch block will now properly handle errors from .save()
    console.error('Error submitting feature request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reportAutofillIssue = async (req, res) => {
  const { pageUrl, fieldName, issueType, additionalNotes } = req.body;

  if (!pageUrl || !fieldName || !issueType) {
    return res.status(400).json({
      message: 'pageUrl, fieldName, and issueType are required',
    });
  }

  try {
    const autofillIssue = new NewFeature({
      title: `Autofill issue: ${fieldName}`,
      message:
        additionalNotes?.trim() ||
        `Autofill issue reported for ${fieldName} (${issueType})`,
      pageUrl,
      fieldName,
      issueType,
      additionalNotes,
      source: 'autofill-issue',
    });

    await autofillIssue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('autofill-issue-report', {
        pageUrl,
        fieldName,
        issueType,
        additionalNotes,
      });
    }

    res.status(200).json({ message: 'Autofill issue reported successfully' });
  } catch (error) {
    console.error('Error reporting autofill issue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNewFeatures = async (req, res) => {
  try {
    const newFeatures = await NewFeature.find();
    res.status(200).json(newFeatures);
  } catch (error) {
    console.error('Error fetching new features:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
