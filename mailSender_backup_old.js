import { scheduleJob } from "node-schedule";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.auth" });

const sendEmail = async (options) => {
  if (options.recipients && options.content) {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.HOSTPORT,
      secure: false,
      service: process.env.SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.PASSWORD,
      },
    });

    const mailConfigurations = (recipient) => ({
      from: `${options.sender || "Unknown Sender"} <${process.env.EMAIL_USERNAME}>`,
      bcc: recipient,
      replyTo: `do not reply to this email ${process.env.EMAIL_USERNAME}`,
      subject: options.subject,
      text: options.content,
      attachments: [
        {
          filename: "Anouar-Ech-charai.pdf",
          path: "./Anouar-Ech-charai.pdf",
        },
      ],
    });

    if (options.scheduledDate) {
      let delay = 0;

      options.recipients.forEach((recipient, index) => {
        setTimeout(() => {
          transporter.sendMail(mailConfigurations(recipient), (err, info) => {
            if (err) {
              console.error(`❌ Failed to send email to ${recipient}:`, err);
            } else {
              console.log(`✅ Email sent to ${recipient} successfully`);
              console.log(info);
            }
          });
        }, delay);

        delay += 10000;
      });

    } else {
      console.log(`Please provide a date and time to start sending emails!!`);
    }
  } else {
    console.error(`Recipients list and email content cannot be empty!!`);
  }
};

export default sendEmail;
