require('dotenv').config();
const nodemailer = require('nodemailer');

//Send reset token to the users email address
const sendMail = (userEmail, options) => {
     const transporter = nodemailer.createTransport({ //The mail transporter
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = { //The email message
        to: userEmail,
        from: 'immanueldiai@gmail.com',
        subject: options.subject,
        text: options.text
    };

    transporter.sendMail(mailOptions); //Send the email
}

module.exports = sendMail;