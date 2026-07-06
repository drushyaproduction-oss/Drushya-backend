import { Resend } from "resend";

let resend;

export const sendEmail = async (options) => {
    try {
        if (!resend) {
            // Using the API key from .env file
            resend = new Resend(process.env.RESEND_API_KEY);
        }

        const data = await resend.emails.send({
            from: "Drushya Admin <onboarding@resend.dev>",
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
            throw new Error(data.error.message);
        }

        console.log(`Email sent successfully to ${options.email} using Resend`);
    } catch (error) {
        console.error("CRITICAL ERROR in sendEmail (Resend):", error);
        throw new Error("Failed to send email");
    }
};
