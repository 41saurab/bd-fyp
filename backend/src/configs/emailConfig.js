import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const createTransport = () => {
	if (process.env.EMAIL_SERVICE === "gmail") {
		return nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	return nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		secure: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
};

const transporter = createTransport();

transporter.verify((error, success) => {
	if (error) {
		console.error(`Email configuration error: ${error}`);
	} else {
		console.log(`Email service is ready to send emails`);
	}
});

export default transporter;
