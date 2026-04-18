const nodemailer = require('nodemailer');

// REUSABLE TRANSPORTER HELPER
const getTransporter = async () => {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10) || 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });
};

// WELCOME EMAIL
const sendWelcomeEmail = async (userEmail, userName, verificationLink) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: `"The UniVerse Team" <${process.env.EMAIL_SENDER}>`,
            to: userEmail,
            subject: "Verify your UniVerse Account",
            html: `
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                    <title>Welcome to UniVerse</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:36px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(2,6,23,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(90deg,#4f46e5 0%,#06b6d4 100%);padding:26px;text-align:center;color:#ffffff;">
                                            <img src="https://i.imgur.com/tjMI3SZ.png" alt="UniVerse" width="120" style="display:block;margin:0 auto 8px auto;" />
                                            <h1 style="margin:0;font-size:20px;font-weight:700;">Welcome to UniVerse</h1>
                                            <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">Plan smarter. Study better. Reach your goals.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:26px;">
                                            <h2 style="font-size:18px;margin:0 0 10px;">Hi ${userName},</h2>
                                            <p style="margin:0 0 16px;color:#475569;line-height:1.45;">Thanks for joining <strong>UniVerse</strong> — your Academic Priority Engine. <strong>Please verify your email address</strong> to activate your account and explore your new workspace.</p>

                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 18px;">
                                                <tr>
                                                    <td style="vertical-align:top;padding-bottom:12px;">
                                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:56px;height:56px;border-radius:10px;background:#eef2ff;text-align:center;vertical-align:middle;">
                                                                    <img src="https://img.icons8.com/fluency/48/000000/add-property.png" alt="Add" width="28" style="margin-top:14px;"/>
                                                                </td>
                                                                <td style="padding-left:12px;vertical-align:middle;">
                                                                    <strong style="display:block;color:#0f172a;">Add Your First Assignment</strong>
                                                                    <span style="display:block;color:#64748b;font-size:13px;">Enter due date & weight — let the Priority Engine do the rest.</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="vertical-align:top;padding-bottom:12px;">
                                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:56px;height:56px;border-radius:10px;background:#fff7ed;text-align:center;vertical-align:middle;">
                                                                    <img src="https://img.icons8.com/fluency/48/000000/room.png" alt="Group" width="28" style="margin-top:14px;"/>
                                                                </td>
                                                                <td style="padding-left:12px;vertical-align:middle;">
                                                                    <strong style="display:block;color:#0f172a;">Create a Group Room</strong>
                                                                    <span style="display:block;color:#64748b;font-size:13px;">Collaborate with teammates and share tasks effortlessly.</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="vertical-align:top;">
                                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width:56px;height:56px;border-radius:10px;background:#ecfeff;text-align:center;vertical-align:middle;">
                                                                    <img src="https://img.icons8.com/fluency/48/000000/dashboard.png" alt="Dashboard" width="28" style="margin-top:14px;"/>
                                                                </td>
                                                                <td style="padding-left:12px;vertical-align:middle;">
                                                                    <strong style="display:block;color:#0f172a;">Check Your Dashboard</strong>
                                                                    <span style="display:block;color:#64748b;font-size:13px;">View your Focus Card to see what's important today.</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <div style="text-align:center;margin:18px 0;">
                                                <a href="${verificationLink}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:700;">Verify Email Address</a>
                                            </div>

                                            <p style="margin:12px 0 0;color:#64748b;font-size:13px;">If you need help, reply to this email or visit our Help Center in the app.</p>

                                            <hr style="border:none;border-top:1px solid #eef2ff;margin:20px 0;" />

                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="vertical-align:middle;">
                                                        <p style="margin:0;font-size:13px;color:#94a3b8;">UniVerse — Academic Productivity Tools</p>
                                                        <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Manage notifications in Settings. We're here to help.</p>
                                                    </td>
                                                    <td style="text-align:right;vertical-align:middle;">
                                                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;margin-left:8px;"><img src="https://img.icons8.com/fluency/48/000000/twitter.png" alt="Twitter" width="28" style="vertical-align:middle;"/></a>
                                                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;margin-left:8px;"><img src="https://img.icons8.com/fluency/48/000000/instagram-new.png" alt="Instagram" width="28" style="vertical-align:middle;"/></a>
                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background:#0f172a;color:#ffffff;padding:14px 20px;font-size:12px;text-align:center;">
                                            <span style="opacity:0.9;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</span><br/>
                                            <span style="opacity:0.9;">If you didn't sign up for UniVerse, you can safely ignore this email.</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome/Verification email sent to ${userEmail}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Preview URL: ${previewUrl}`);
    } catch (error) {
        console.error(`Error sending welcome email:`, error);
    }
};

// FORGOT PASSWORD EMAIL
const sendForgotPasswordEmail = async (userEmail, userName, resetLink) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: `"The UniVerse Team" <${process.env.EMAIL_SENDER}>`,
            to: userEmail,
            subject: "Reset your UniVerse Password",
            html: `
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                    <title>Reset Your Password</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:36px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(2,6,23,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(90deg,#4f46e5 0%,#06b6d4 100%);padding:26px;text-align:center;color:#ffffff;">
                                            <img src="https://i.imgur.com/tjMI3SZ.png" alt="UniVerse" width="120" style="display:block;margin:0 auto 8px auto;" />
                                            <h1 style="margin:0;font-size:20px;font-weight:700;">Password Reset Request</h1>
                                            <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">Secure your UniVerse account.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:26px;">
                                            <h2 style="font-size:18px;margin:0 0 10px;">Hi ${userName},</h2>
                                            <p style="margin:0 0 16px;color:#475569;line-height:1.5;">We received a request to reset the password for your <strong>UniVerse</strong> account. Click the button below to securely choose a new password.</p>
                                            
                                            <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
                                                <p style="margin:0;color:#c2410c;font-size:13px;font-weight:600;">⚠️ This link is secure and will expire in exactly 10 minutes.</p>
                                            </div>

                                            <div style="text-align:center;margin:24px 0;">
                                                <a href="${resetLink}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;display:inline-block;font-weight:700;">Reset Password</a>
                                            </div>

                                            <p style="margin:12px 0 0;color:#64748b;font-size:13px;line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:<br/>
                                                <a href="${resetLink}" style="color:#4f46e5;word-break:break-all;">${resetLink}</a>
                                            </p>

                                            <hr style="border:none;border-top:1px solid #eef2ff;margin:24px 0;" />

                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="vertical-align:middle;">
                                                        <p style="margin:0;font-size:13px;color:#94a3b8;">UniVerse — Academic Productivity Tools</p>
                                                        <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">If you did not request this, you can safely ignore this email.</p>
                                                    </td>
                                                    <td style="text-align:right;vertical-align:middle;">
                                                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;margin-left:8px;"><img src="https://img.icons8.com/fluency/48/000000/twitter.png" alt="Twitter" width="28" style="vertical-align:middle;"/></a>
                                                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;margin-left:8px;"><img src="https://img.icons8.com/fluency/48/000000/instagram-new.png" alt="Instagram" width="28" style="vertical-align:middle;"/></a>
                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background:#0f172a;color:#ffffff;padding:14px 20px;font-size:12px;text-align:center;">
                                            <span style="opacity:0.9;">© ${new Date().getFullYear()} UniVerse. All rights reserved.</span><br/>
                                            <span style="opacity:0.9;">Your account security is our priority.</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${userEmail}`);
        
        // Helpful for local testing
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Preview URL: ${previewUrl}`);
        
    } catch (error) {
        console.error(`Error sending password reset email:`, error);
    }
};


// MEETING INVITE EMAIL
const sendMeetingInviteEmail = async (userEmail, userName, eventDetails) => {
    try {
        const transporter = await getTransporter();
        
        const mailOptions = {
            from: `"UniVerse Notifications" <${process.env.EMAIL_SENDER}>`,
            to: userEmail,
            subject: `New Invite: ${eventDetails.title} with ${eventDetails.creatorName}`,
            html: `
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                </head>
                <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:36px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(2,6,23,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(90deg,#4f46e5 0%,#06b6d4 100%);padding:26px;text-align:center;color:#ffffff;">
                                            <h1 style="margin:0;font-size:20px;font-weight:700;">📅 New Meeting Invite</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:26px;">
                                            <h2 style="font-size:18px;margin:0 0 10px;">Hi ${userName},</h2>
                                            <p style="margin:0 0 16px;color:#475569;line-height:1.45;"><strong>${eventDetails.creatorName}</strong> has invited you to a new event on UniVerse!</p>

                                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 15px;">
                                                <h3 style="margin-top: 0; color: #0f172a;">${eventDetails.title}</h3>
                                                <p style="margin: 5px 0; color: #475569;"><strong>When:</strong> ${eventDetails.time}</p>
                                                ${eventDetails.description ? `<p style="margin: 5px 0; color: #475569;"><strong>Details:</strong> ${eventDetails.description}</p>` : ''}
                                            </div>

                                            <div style="text-align:center;margin:24px 0 10px;">
                                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/calendar" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:700;">View in Calendar</a>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Invite email sent to ${userEmail}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Invite Preview URL: ${previewUrl}`);
    } catch (error) {
        console.error(`Error sending invite email:`, error);
    }
};

// THE NEW TASK ASSIGNMENT EMAIL
const sendTaskAssignmentEmail = async (userEmail, userName, taskDetails) => {
    try {
        const transporter = await getTransporter();
        
        const mailOptions = {
            from: `"UniVerse Notifications" <${process.env.EMAIL_SENDER}>`,
            to: userEmail,
            subject: `New Task Assigned: ${taskDetails.taskName}`,
            html: `
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                </head>
                <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:36px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(2,6,23,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(90deg,#4f46e5 0%,#06b6d4 100%);padding:26px;text-align:center;color:#ffffff;">
                                            <h1 style="margin:0;font-size:20px;font-weight:700;">✅ New Task Assigned</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:26px;">
                                            <h2 style="font-size:18px;margin:0 0 10px;">Hi ${userName},</h2>
                                            <p style="margin:0 0 16px;color:#475569;line-height:1.45;"><strong>${taskDetails.assignerName}</strong> has assigned a new task to you in <strong>${taskDetails.groupName}</strong>.</p>

                                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 15px;">
                                                <h3 style="margin-top: 0; color: #0f172a;">${taskDetails.taskName}</h3>
                                                ${taskDetails.dueDate ? `<p style="margin: 5px 0; color: #475569;"><strong>🎯 Due Date:</strong> ${taskDetails.dueDate}</p>` : ''}
                                                ${taskDetails.priority ? `<p style="margin: 5px 0; color: #475569;"><strong>⚡ Priority:</strong> ${taskDetails.priority}</p>` : ''}
                                            </div>

                                            <div style="text-align:center;margin:24px 0 10px;">
                                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:700;">View Task in UniVerse</a>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Task assignment email sent to ${userEmail}`);
        
        // Log preview URL if using Ethereal testing account
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Task Email Preview URL: ${previewUrl}`);
    } catch (error) {
        console.error(`Error sending task assignment email:`, error);
    }
 

};

// 4. EXPORT BOTH FUNCTIONS
module.exports = { 
    sendWelcomeEmail,
    sendForgotPasswordEmail, 
    sendMeetingInviteEmail, 
    sendTaskAssignmentEmail
};