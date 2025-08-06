import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  auth: {
    user: 'f41f47fefc4d53',
    pass: '6a93f67c18f8a7',
  },
});
