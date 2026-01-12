import sgMail from "@sendgrid/mail";

sgMail.setApiKey( process.env.SENDGRID_API_KEY );
console.log( "📧 EMAIL PROVIDER: SENDGRID" );
const sendEmail = async ( to, subject, text ) => {
    await sgMail.send( {
        to,
        from: process.env.SENDGRID_SENDER,
        subject,
        text,
    } );
};

export default sendEmail;
