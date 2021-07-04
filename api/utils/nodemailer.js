const nodemailer = require('nodemailer');
require('dotenv').config();
const adminEmail = process.env.ADMINEMAIL;
const adminPassword = process.env.ADMINPASSWORD;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    service: 'gmail',
    auth: {
        user: adminEmail,
        pass: adminPassword,
    },
});
exports.sendEmail = async (email, token) => {
    let mailOptions = {
        from: adminEmail, // sender address
        to: email, // list of receivers
        subject: 'Account Verification Token', // Subject line
        text: 'Hello my friend',
        html:
            '<b>Verify your account</b>' +
            ' <br/>' +
            '<span>Please verify your account by clicking the link</span>' +
            '<br/>' +
            '<span>https://estore-kltn.herokuapp.com/confirm/' +
            token +
            '</span>',
    };
    try {
        let send = await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
};

exports.sendEmailForgotPassword = async (email, token) => {
    let mailOptions = {
        from: '"SHOOPER 👻" <minhphuson99@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Forgot password Verification Token', // Subject line
        html:
            '<b>Forgot password</b>' +
            ' <br/>' +
            '<span>Please enter OTP below</span>' +
            '<br/>' +
            '<span>' +
            token +
            '</span>',
    };
    try {
        let send = await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
};
exports.sendMailConfirmPayment = async (email, token) => {
    let mailOptions = {
        from: '"SHOOPER 👻" <confesstionceo@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Payment Verification Token', // Subject line
        text: 'Hello my friend',
        html:
            '<b>verify your account</b>' +
            ' <br/>' +
            '<span>Please verify your account by clicking the link</span>' +
            '<br/>' +
            '<span>https://estore-kltn.herokuapp.com/payment/' +
            token +
            '</span>',
    };
    try {
        let send = await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
};
