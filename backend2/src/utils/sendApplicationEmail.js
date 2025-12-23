import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { User } from '../models/User.model.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export const sendApplicationEmail = async (
  studentEmail,
  recruiterEmail,
  jobDetails,
) => {
  try {
    // Fetch user's refresh token
    const user = await User.findOne({ email: studentEmail });
    if (!user?.googleRefreshToken) {
      throw new Error('No refresh token found for user');
    }

    // Set OAuth2 credentials
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const accessToken = await oauth2Client.getAccessToken();

    // Create Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: studentEmail,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: user.googleRefreshToken,
        accessToken: accessToken.token,
      },
    });

    // Email content
    const mailOptions = {
      from: studentEmail,
      to: recruiterEmail,
      subject: `Job Application: ${jobDetails.jobTitle}`,
      text: `Dear Recruiter,\n\nI am applying for the ${jobDetails.jobTitle} position.\n\n${jobDetails.coverLetter}\n\nBest regards,\n${studentEmail}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
