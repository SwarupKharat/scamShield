const twilio = require('twilio');
const axios = require('axios');

class MessagingService {
    constructor() {
        // Initialize Twilio client (you'll need to add these to your .env)
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        
        // WhatsApp Business API configuration
        this.whatsappConfig = {
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
            apiUrl: 'https://graph.facebook.com/v17.0'
        };
    }

    // Send SMS using Twilio
    async sendSMS(to, message) {
        try {
            if (!process.env.TWILIO_ACCOUNT_SID) {
                console.log('SMS: Twilio not configured, simulating SMS:', { to, message });
                return { success: true, messageId: 'simulated-sms-' + Date.now() };
            }

            const result = await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });

            console.log('SMS sent successfully:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send WhatsApp message using WhatsApp Business API
    async sendWhatsApp(to, message) {
        try {
            if (!this.whatsappConfig.accessToken) {
                console.log('WhatsApp: API not configured, simulating WhatsApp:', { to, message });
                return { success: true, messageId: 'simulated-whatsapp-' + Date.now() };
            }

            const response = await axios.post(
                `${this.whatsappConfig.apiUrl}/${this.whatsappConfig.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: {
                        body: message
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.whatsappConfig.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('WhatsApp message sent successfully:', response.data);
            return { success: true, messageId: response.data.messages[0].id };
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return { success: false, error: error.message };
        }
    }

    // Send incident alert to nearby users
    async sendIncidentAlert(incident, nearbyUsers) {
        const message = this.formatIncidentAlert(incident);
        
        const results = [];
        
        for (const user of nearbyUsers) {
            if (user.mobile) {
                // Send SMS
                const smsResult = await this.sendSMS(user.mobile, message);
                results.push({ user: user._id, type: 'SMS', ...smsResult });
                
                // Send WhatsApp if available
                const whatsappResult = await this.sendWhatsApp(user.mobile, message);
                results.push({ user: user._id, type: 'WhatsApp', ...whatsappResult });
            }
        }
        
        return results;
    }

    // Send helpline response
    async sendHelplineResponse(userMobile, responseMessage) {
        const results = [];
        
        // Send SMS response
        const smsResult = await this.sendSMS(userMobile, responseMessage);
        results.push({ type: 'SMS', ...smsResult });
        
        // Send WhatsApp response
        const whatsappResult = await this.sendWhatsApp(userMobile, responseMessage);
        results.push({ type: 'WhatsApp', ...whatsappResult });
        
        return results;
    }

    // Format incident alert message
    formatIncidentAlert(incident) {
        return `🚨 SCAM ALERT 🚨

New scam incident reported near your area:

📍 Location: ${incident.location}
📮 Pincode: ${incident.pincode}
⚠️ Severity: ${incident.severity.toUpperCase()}
📝 Description: ${incident.description.substring(0, 100)}...

Stay vigilant and report any suspicious activity!

For immediate help, contact our helpline:
📞 SMS: Send HELP to +91-XXXX-XXXXXX
💬 WhatsApp: +91-XXXX-XXXXXX

Stay Safe! 🛡️`;
    }

    // Format helpline welcome message
    formatHelplineWelcome() {
        return `🆘 SCAM HELPLINE 🆘

Welcome to Prabhodhanyaya Scam Helpline!

We're here to help you with:
✅ Scam verification
✅ Emergency assistance
✅ Reporting guidance
✅ Safety tips

How can we help you today?

Reply with:
- VERIFY: To check if something is a scam
- REPORT: To report a new scam
- HELP: For general assistance
- TIPS: For safety tips

Our team will respond within minutes! 🚀`;
    }

    // Format verification response
    formatVerificationResponse(isScam, details) {
        if (isScam) {
            return `🚨 SCAM DETECTED! 🚨

This appears to be a SCAM. Here's what to do:

❌ DO NOT:
- Share personal information
- Send money or gift cards
- Click suspicious links
- Provide OTP or passwords

✅ DO:
- Block the contact immediately
- Report to local police
- Inform your bank if money involved
- Share this with family/friends

Details: ${details}

Need immediate help? Reply HELP for assistance.`;
        } else {
            return `✅ VERIFICATION COMPLETE ✅

This appears to be LEGITIMATE. However, always verify:

🔍 Check official websites
📞 Call official numbers
🏢 Visit physical locations
👥 Ask trusted friends/family

When in doubt, it's better to be cautious!

Need more help? Reply HELP for assistance.`;
        }
    }

    // Send emergency alert
    async sendEmergencyAlert(userMobile, emergencyType, location) {
        const message = `🚨 EMERGENCY ALERT 🚨

URGENT: ${emergencyType.toUpperCase()}

📍 Location: ${location}
⏰ Time: ${new Date().toLocaleString()}

Immediate action required!

Contact:
🚔 Police: 100
🏥 Medical: 108
🔥 Fire: 101

Our helpline is monitoring this situation.
Stay safe and follow official instructions.

Reply SAFE when you're secure.`;
        
        const results = [];
        results.push(await this.sendSMS(userMobile, message));
        results.push(await this.sendWhatsApp(userMobile, message));
        
        return results;
    }

    // Send safety tips
    async sendSafetyTips(userMobile) {
        const message = `🛡️ SCAM PREVENTION TIPS 🛡️

📱 PHONE SCAMS:
- Never share OTP with anyone
- Banks never ask for passwords
- Verify caller identity

💻 ONLINE SCAMS:
- Check website URLs carefully
- Don't click suspicious links
- Use strong passwords

💰 MONEY SCAMS:
- Verify investment opportunities
- Don't pay upfront fees
- Use official payment methods

📞 EMERGENCY CONTACTS:
- Police: 100
- Cyber Crime: 1930
- Our Helpline: +91-XXXX-XXXXXX

Share these tips with family! 💙`;
        
        const results = [];
        results.push(await this.sendSMS(userMobile, message));
        results.push(await this.sendWhatsApp(userMobile, message));
        
        return results;
    }
}

module.exports = new MessagingService();
