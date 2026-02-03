import nodeMailer from "nodemailer";
import { config } from "dotenv";
config({ path: 'config.env' });

// Security Warning: Production me credentials log mat karna
// console.log("username and password", process.env.SMTP_MAIL, process.env.SMTP_PASSWORD) 

export const sendEmail = async ({ email, subject, message }) => {
    
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST, // smtp.gmail.com
        port: process.env.SMTP_PORT, // Render Env me 587 daalna
        
        // IMPORTANT CHANGE: 587 ke liye false, 465 ke liye true
        secure: process.env.SMTP_PORT == 465, 
        
        // service: process.env.SMTP_SERVICE, // Ise comment kar do, Host/Port better hai
        
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        // TLS issue fix karne ke liye (kabhi kabhi Render ke naye IP trusted nahi hote)
        tls: {
            rejectUnauthorized: false 
        }
    });

    const options = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html: message,
    };

    await transporter.sendMail(options);
};