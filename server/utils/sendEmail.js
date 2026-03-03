import { config } from "dotenv";
config({ path: 'config.env' });

export const sendEmail = async ({ email, subject, message }) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Home Verify",
                    email: process.env.SENDER_EMAIL // noreply.homeverify@gmail.com
                },
                to: [
                    { email: email }
                ],
                subject: subject,
                htmlContent: message
            })
        });

        // Agar Brevo ne error diya toh pakadne ke liye
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Rejected the request:", errorData);
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Email successfully sent to ${email} via Brevo API. Message ID:`, data.messageId);

    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};