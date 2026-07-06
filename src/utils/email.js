import nodemailer from "nodemailer";

let transporter;

export const sendEmail = async (options) => {
    try {
        if (!transporter) {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                },
                pool: true,
                maxConnections: 1,
                maxMessages: 10
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
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error("CRITICAL ERROR in sendEmail:", error);
        throw new Error("Failed to send email");
    }
};
