require('dotenv').config();
const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const adminEmail = process.env.ADMINEMAIL;

exports.sendEmail = async (email, token) => {
    let mailOptions = {
        from: adminEmail, // sender address
        to: email, // list of receivers
        subject: 'Account Verification Token', // Subject line
        text: 'Hello my friend',
        html: '<b>verify your account</b>'
            + ' <br/>'
            + '<span>Please verify your account by clicking the link</span>'
            + '<br/>'
            + '<span>http://localhost:3000/confirm/' + token +  '</span>'
	};
    try{
		let sendMail = await sendgrid.send(mailOptions);
		console.log(sendMail);
    }
    catch(err){
        console.log(err);
        return false;
    }
    return true;
}
