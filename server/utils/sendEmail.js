const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        let transporter;

        // Prefer real SMTP settings from environment variables
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT, 10) || 587,
                secure: (process.env.EMAIL_SECURE === 'true') || false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Fallback to Ethereal test account if no SMTP is configured
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: `"The UniVerse Team" <${process.env.EMAIL_USER || 'no-reply@universe.local'}>`,
            to: userEmail,
            subject: "Welcome to UniVerse! Let's conquer your deadlines.",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px;">
            
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://i.imgur.com/tjMI3SZ.png" alt="UniVerse Logo" style="max-width: 150px; height: auto;" />
            </div>

            <h2 style="color: #2c3e50;">Hi ${userName},</h2>
            <p>Welcome to <strong>UniVerse</strong>! We are thrilled to have you on board.</p>
            <p>We know how overwhelming the academic semester can get, which is exactly why this platform was built. You no longer have to guess what to study next—our Academic Priority Engine will do the heavy lifting for you.</p>
            
            <h3 style="color: #2c3e50;">Here is how to get the most out of UniVerse right now:</h3>
            <ul>
                <li style="margin-bottom: 10px;"><strong>Add Your First Assignment:</strong> Drop in a due date and its weight, and watch the Priority Engine sort it instantly.</li>
                <li style="margin-bottom: 10px;"><strong>Create a Group Room:</strong> Working on a group project? Generate an invite code and get your team synced up.</li>
                <li style="margin-bottom: 10px;"><strong>Check Your Dashboard:</strong> Keep an eye on the color-coded Focus Card to see exactly what needs your attention today.</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to My Dashboard</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">If you run into any issues or have feedback, just hit reply to this email.</p>
            <p style="font-size: 14px; color: #666;">Let’s make this your most productive semester yet.<br><br>Best,<br><strong>The UniVerse Team</strong></p>
        </div>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${userEmail}`);

        // If using Ethereal/test account, log preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Preview URL: ${previewUrl}`);

    } catch (error) {
        console.error(`Error sending welcome email:`, error);
    }
};

module.exports = sendWelcomeEmail;