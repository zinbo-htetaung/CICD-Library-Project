const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

// Create a transporter object using your Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zhouhuanquan21342@gmail.com',
        pass: 'hxoybjktjqajefdr',
    },
});

// Function to send email
module.exports.sendEmail = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const captchaResponse = req.body["g-recaptcha-response"];

        if (!captchaResponse) {
            return res.status(400).json({ error: "CAPTCHA is required. Please verify you are not a robot." });
        }

        const secretKey = "6LfMGboqAAAAAPXLtwKP9GUaVE9Ly2eqJKsHQLYw";
        const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";

        const response = await fetch(verificationUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ secret: secretKey, response: captchaResponse }),
        });

        const captchaResult = await response.json();
        console.log("🔹 reCAPTCHA Response:", captchaResult);

        if (!captchaResult.success) {
            return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
        }

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields (name, email, and message) are required." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const mailOptions = {
            from: `"Library Contact Form" <zhouhuanquan21342@gmail.com>`, // Your email
            to: "zhouhuanquan21342@gmail.com", // Your inbox to receive messages
            replyTo: email, // User's email for direct replies
            subject: `📩 New Message from ${name}`, // Email subject
            text: `You have received a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // Plain text body
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2 style="color: #007BFF;">📩 New Message from ${name}</h2>
                    <p style="font-size: 16px; color: #555;">
                        <strong>Name:</strong> ${name}<br>
                        <strong>Email:</strong> <a href="mailto:${email}" style="color: #007BFF;">${email}</a>
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        <strong>Message:</strong>
                    </p>
                    <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin: 10px 0; color: #555; font-size: 16px;">
                        ${message.replace(/\n/g, "<br>")}
                    </blockquote>
                    <p style="font-size: 14px; color: #777;">
                        <em>This message was sent from the Library Contact Form.</em>
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                    <p style="font-size: 14px; color: #555; text-align: center;">
                        <strong>Library Contact Form</strong><br>
                        <a href="mailto:zhouhuanquan21342@gmail.com" style="color: #007BFF;">zhouhuanquan21342@gmail.com</a>
                    </p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Error sending email:", error);
                return res.status(500).json({ error: "Error sending email. Please try again later." });
            }

            console.log("Email sent: " + info.response);
            return res.status(200).json({ message: "Your message has been sent successfully. We will get back to you shortly!" });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    }
};