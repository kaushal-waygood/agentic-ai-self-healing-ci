const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html = null) => {
  try {
    // Create transporter using Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_HOST_USER || 'pydev.online@gmail.com',
        pass: process.env.EMAIL_HOST_PASSWORD || 'wvpt dzjp bgfs vqzy',
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER || 'pydev.online@gmail.com',
      to, // Recipient's email
      subject, // Subject of the email
      text, // Plain text body
      html, // HTML body (optional)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendMail };
