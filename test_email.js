import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'rushikeshl1998@gmail.com',
    subject: 'Test Email',
    text: 'If you get this, the password works locally!'
};

console.log('Testing Nodemailer locally with:', process.env.SMTP_USER);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email locally:', error);
    } else {
        console.log('Email sent locally:', info.response);
    }
    process.exit();
});
