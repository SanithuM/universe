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
            subject: "Welcome to UniVerse — Ready to prioritize your semester?",
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
                                            <p style="margin:0 0 16px;color:#475569;line-height:1.45;">Thanks for joining <strong>UniVerse</strong> — your Academic Priority Engine. Here are a few quick steps to get you started and see value immediately.</p>

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
                                                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:700;">Open My Dashboard</a>
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
        console.log(`Welcome email sent to ${userEmail}`);

        // If using Ethereal/test account, log preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Preview URL: ${previewUrl}`);

    } catch (error) {
        console.error(`Error sending welcome email:`, error);
    }
};

module.exports = sendWelcomeEmail;