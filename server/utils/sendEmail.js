import nodeMailer from "nodemailer";
import { config } from "dotenv";
config({ path: 'config.env' });

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST, 
        port: process.env.SMTP_PORT, 
        secure: process.env.SMTP_PORT == 465, 
        auth: {
            user: process.env.SMTP_MAIL, 
            pass: process.env.SMTP_PASSWORD, 
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    const options = {
        
        from: `"Home Verify" <${process.env.SENDER_EMAIL}>`, 
        to: email,
        subject,
        html: message,
    };

    await transporter.sendMail(options);
    console.log(`Email successfully sent to ${email} via Brevo`);
};