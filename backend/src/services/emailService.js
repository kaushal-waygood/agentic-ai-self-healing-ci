import { transporter } from '../utils/transporter.js';

export const sendJobApplicationEmail = async (job, student, recipientEmail) => {
  const mailOptions = {
    from: `"${student.fullName}" <${student.email}>`,
    to: recipientEmail,
    subject: `Application for ${job.title}`,
    text: `Hi,\n\nI'm interested in the ${job.title} position.\n\nBest regards,\n${student.fullName}`,
    // Optional HTML version:
    html: `
      <p>Hi,</p>
      <p>I'm interested in the <strong>${job.title}</strong> position.</p>
      <p>Best regards,<br>${student.fullName}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
};
