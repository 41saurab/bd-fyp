import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

class MailService {
	constructor() {
		const config = {
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT) || 465,
			secure: Number(process.env.SMTP_PORT) === 465,
			auth: {
				user: process.env.SMTP_MAIL,
				pass: process.env.SMTP_PASSWORD,
			},
		};

		if (process.env.SMTP_SERVICE === "gmail") {
			config.service = "gmail";
		}

		this.transport = nodemailer.createTransport(config);

		console.log("Ready to send emails");
	}

	sendEmail = async (to, subject, htmlBody, attachments = []) => {
		const mailOptions = {
			to,
			from: `<${process.env.SMTP_MAIL}>`,
			subject,
			html: htmlBody,
		};

		if (attachments.length) {
			mailOptions.attachments = attachments;
		}

		return await this.transport.sendMail(mailOptions);
	};
}

export const mailSvc = new MailService();
