import nodeMailer from "nodemailer";
import { config } from "dotenv";
config({ path: 'config.env' });
console.log("username and password", process.env.SMTP_MAIL,process.env.SMTP_PASSWORD)

export const sendEmail= async ({email,subject,message})=>{
    const transporter=nodeMailer.createTransport(
        {
            host:process.env.SMTP_HOST,
            service:process.env.SMTP_SERVICE,
            port:process.env.SMTP_PORT,
            secure: true, 
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMTP_PASSWORD,
            }

        }
    );

    const options={
        from:process.env.SMTP_MAIL,
        to:email,
        subject,
        html:message,
    };
    await transporter.sendMail(options);

}