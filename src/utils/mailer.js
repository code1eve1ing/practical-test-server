require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PSWD
  }
});

module.exports = transporter;
