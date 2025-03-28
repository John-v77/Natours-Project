const nodemailer = require('nodemailer')

const sendEmail = async options => {

  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT2,
    auth: {
      user: process.env.EMAIL_USERNAME_MAILTRAP,
      pass: process.env.EMAIL_PASSWORD_MAILTRAP
    }
  });

  // 2) DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: 'John Vas <hello@jtest.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: --will help format the message into html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
