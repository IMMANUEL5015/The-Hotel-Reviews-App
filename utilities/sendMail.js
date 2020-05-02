require('dotenv').config();
const nodemailer = require('nodemailer');

//Send reset token to the users email address
const sendMail = (userEmail, options) => {
    const transporter = nodemailer.createTransport({ //The mail transporter
        service: 'SendGrid',
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD
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