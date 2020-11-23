const nodemailer = require('nodemailer');

const sendEmail = async(options) => {

	// The smtp configurations
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			type: 'Oauth2',
			user: process.env.SMTP_EMAIL,
			pass: process.env.SMTP_PASSWORD
		}
	})

	const message = {
		from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
		to: options.email,
		subject: options.subject,
		text: options.message
	};

	const info = await transporter.sendMail(message);

	console.log(`Message sent: ${info.messageId}`);
}

module.exports = sendEmail;