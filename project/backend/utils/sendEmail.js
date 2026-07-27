const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter using Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SENDER_EMAIL, // Must be your full Hostinger email address (e.g. support@kaunsahostel.com)
        pass: process.env.SMTP_PASSWORD, // The password for this specific email account
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'KaunsaHostel'} <${process.env.SENDER_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent successfully to ${options.email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email via SMTP:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
