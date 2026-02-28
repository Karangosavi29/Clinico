import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       // e.g., smtp.gmail.com
      port: process.env.SMTP_PORT,       // e.g., 587
      secure: false,                     // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,     // your email
        pass: process.env.SMTP_PASS,     // your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: `"Clinico" <karangosavi29052006@gmail.com>`,
      to,
      subject,
      html: htmlContent,
      replyTo: "support@clinico.com",
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
