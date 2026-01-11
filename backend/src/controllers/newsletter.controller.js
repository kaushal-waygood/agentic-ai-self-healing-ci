import { Newsletter } from '../models/newsletter.model.js';

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip;
};

export const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const ip = getClientIp(req);

    const newsletter = await Newsletter.create({
      email,
      ip,
    });

    return res.status(201).json({
      message: 'Subscribed to newsletter successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email already subscribed',
      });
    }

    console.error('Error subscribing to newsletter:', error);
    return res.status(500).json({
      message: 'Failed to subscribe to newsletter',
    });
  }
};

export const unsubscribeFromNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const newsletter = await Newsletter.findOneAndDelete({ email });

    if (!newsletter) {
      return res.status(404).json({ message: 'Email not subscribed' });
    }

    return res.status(200).json({
      message: 'Unsubscribed from newsletter successfully',
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return res.status(500).json({
      message: 'Failed to unsubscribe from newsletter',
    });
  }
};

