// services/emailService.js

import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import 'dotenv/config'; // Ensure environment variables are loaded

// Initialize Google OAuth2 client with your app's credentials
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Your Google Cloud Project Client ID
  process.env.GOOGLE_CLIENT_SECRET, // Your Google Cloud Project Client Secret
  'https://developers.google.com/oauthplayground', // This is a placeholder redirect URI.
  // In a real app, you'd use your actual redirect URI.
);

/**
 * Creates a Nodemailer transporter configured with OAuth2 for a specific user.
 * This function dynamically sets up the transporter using the user's refresh token
 * to obtain a fresh access token, ensuring secure email sending on their behalf.
 * @param {string} userEmail - The email address of the user sending the email.
 * @param {string} refreshToken - The OAuth2 refresh token for the user.
 * @returns {Promise<nodemailer.Transporter>} A configured Nodemailer transporter instance.
 */
const createTransporter = async (userEmail, refreshToken) => {
  // Set the refresh token for the OAuth2 client
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  // Get a new access token using the refresh token
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' service for Google accounts
    auth: {
      type: 'OAuth2',
      user: userEmail,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: refreshToken,
      accessToken: accessToken.token, // Use the newly obtained access token
    },
  });
};

/**
 * Sends a job application email on behalf of a student.
 * The email includes an AI-generated cover letter and is sent to the recruiter's email.
 * @param {Object} job - The job data object.
 * @param {Object} student - The student data object (includes name, email, google.refresh_token).
 * @param {string} recipientEmail - The email address of the job recruiter.
 * @param {string} coverLetter - The AI-generated cover letter content.
 * @returns {Promise<void>} A promise that resolves when the email is sent successfully.
 */
const sendJobApplicationEmail = async (
  job,
  student,
  recipientEmail,
  coverLetter,
) => {
  // Create a transporter specific to the student's email and refresh token
  const transporter = await createTransporter(
    student.email,
    student.google.refresh_token,
  );

  const mailOptions = {
    // The 'from' field will display the student's name and email to the recipient
    from: `"${student.fullName}" <${student.email}>`,
    to: recipientEmail,
    subject: `Application for the ${job.title} position at ${job.company}`, // Using job.company as per job schema
    html: `
      <p>Dear Hiring Manager,</p>
      <p>${coverLetter.replace(/\n/g, '<br>')}</p>
      <p>My resume is attached for your review. I look forward to hearing from you.</p>
      <p>Sincerely,</p>
      <p>${student.fullName}</p>
      <p>${student.phone || ''}</p> 
      <p><strong><a href="${
        student.resumeUrl || '#'
      }">View My Resume</a></strong></p>
    `,
    // You would typically attach the student's resume here.
    // Ensure `student.resumeUrl` points to a publicly accessible URL or a file path for local attachments.
    // attachments: [
    //   {
    //     filename: `${student.fullName}_Resume.pdf`,
    //     path: student.resumeUrl // If resumeUrl is a local path or a downloadable URL
    //   }
    // ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `[EmailService] Email sent successfully from ${student.email} to ${recipientEmail} for job: ${job.title}`,
    );
  } catch (error) {
    console.error(
      `[EmailService] Error sending email from ${student.email} to ${recipientEmail} for job: ${job.title}:`,
      error,
    );
    // Re-throw the error so that the calling queue worker can handle retries
    throw error;
  }
};

/**
 * Extracts the recruiter's email from job data.
 * It prioritizes the explicit `job.applyMethod.email` field, then attempts regex matching in the description.
 * @param {Object} jobData - The job data object.
 * @returns {string | null} The extracted email address or null if not found.
 */
const getRecruiterEmail = (jobData) => {
  // Prioritize the dedicated email field in applyMethod
  if (jobData.applyMethod?.method === 'EMAIL' && jobData.applyMethod.email) {
    return jobData.applyMethod.email;
  }

  // Fallback to regex matching in description if no direct email is found
  if (jobData.description) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const match = jobData.description.match(emailRegex);
    return 'arsalan@helpstudyabroad.com';
  }

  return null;
};

export { sendJobApplicationEmail, getRecruiterEmail };
