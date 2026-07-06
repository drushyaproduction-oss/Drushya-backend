import nodemailer from "nodemailer";

let transporter;

export const sendEmail = async (options) => {
    try {
        if (!transporter) {
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email} - Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to send email via Nodemailer:", error.message);
        console.error("Please ensure SMTP_USER and SMTP_PASS are set correctly in Render Environment Variables.");
        throw new Error("Failed to send email");
    }
};
