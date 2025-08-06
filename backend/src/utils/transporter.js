import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  auth: {
    user: '6ce6c6f68a9242',
    pass: '71ed731eebaf53',
  },
});
