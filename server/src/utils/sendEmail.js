import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport( {
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
} );

export default async function sendEmail( to, subject, text ) {
    await transporter.sendMail( {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    } );
}
