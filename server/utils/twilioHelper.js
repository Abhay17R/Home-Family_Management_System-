import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const twilioPhoneNumber = process.env.TWILIO_NUM;

// Basic check to ensure Twilio credentials are set
if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.warn("--- Twilio credentials are not set in .env file. SMS and Call features will be disabled. ---");
}

const client = twilio(accountSid, authToken);

/**
 * Sends SMS and makes Voice Calls to a list of target users.
 * @param {Array} targets - Array of user objects to notify.
 * @param {string} triggeredByName - Name of the person who triggered the SOS.
 * @param {object} location - Object with lat and lng of the user.
 */
export const sendSmsAndCallAlerts = async (targets, triggeredByName, location) => {
    // If credentials are not set, do nothing.
    if (!accountSid || !authToken || !twilioPhoneNumber) {
        return;
    }

    const googleMapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    
    // Message for Voice Call (TwiML)
    const voiceMessage = `Emergency Alert! ${triggeredByName} needs help. I repeat, ${triggeredByName} has triggered an S O S alert. Their last known location has been sent to you via SMS.`;
    const twiml = `<Response><Say voice="alice" language="en-IN">${voiceMessage}</Say></Response>`;

    // Message for SMS
    const smsMessage = `EMERGENCY ALERT: ${triggeredByName} has triggered an SOS. Last known location: ${googleMapsLink}`;

    const notificationPromises = targets.map(member => {
        // Ensure the member object has a phone number
        if (member && member.phone) {
            // 1. Send SMS
            const smsPromise = client.messages.create({
                body: smsMessage,
                from: twilioPhoneNumber,
                to: member.phone // Phone number must be in E.164 format (e.g., +919876543210)
            }).then(message => console.log(`SMS sent to ${member.name} (SID: ${message.sid})`))
              .catch(err => console.error(`Failed to send SMS to ${member.name}:`, err.message));

            // 2. Make Voice Call
            const callPromise = client.calls.create({
                twiml: twiml,
                to: member.phone,
                from: twilioPhoneNumber
            }).then(call => console.log(`Call initiated to ${member.name} (SID: ${call.sid})`))
              .catch(err => console.error(`Failed to initiate call to ${member.name}:`, err.message));
            
            // Return a promise that resolves when both are done
            return Promise.all([smsPromise, callPromise]);
        }
        // If no phone number, return a resolved promise
        return Promise.resolve();
    });

    try {
        await Promise.all(notificationPromises);
        console.log("All emergency notifications have been dispatched.");
    } catch (error) {
        console.error("An error occurred while dispatching notifications:", error);
    }
};