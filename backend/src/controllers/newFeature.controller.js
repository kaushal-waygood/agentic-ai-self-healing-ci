import { NewFeature } from '../models/newFeature.model.js';

// Make the function async to use await
export const requestNewFeature = async (req, res) => {
  // Destructure 'title' and 'description' from the request body
  const { title, description } = req.body;

  try {
    // Create a new NewFeature instance, mapping 'description' to the 'message' field
    const newFeature = new NewFeature({
      title: title,
      message: description, // <--- This is the key change
    });


    // Await the save operation to ensure it completes before sending a response
    await newFeature.save();

    res.status(200).json({ message: 'Feature request submitted successfully' });
  } catch (error) {
    // The catch block will now properly handle errors from .save()
    console.error('Error submitting feature request:', error);
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
