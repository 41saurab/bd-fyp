import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const donorWelcomeEmailTemplate = (donor) => {
	const subject = "Welcome to Blood Donation System - Registration Successful! 🩸";

	const html = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Welcome to BloodDonate</title>
	</head>

	<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

		<table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f9;padding:40px 20px;">
			<tr>
				<td align="center">

					<table width="600" cellspacing="0" cellpadding="0"
						style="background:#ffffff;border-radius:16px;overflow:hidden;
						box-shadow:0 6px 20px rgba(0,0,0,0.08);">

						<!-- Header -->
						<tr>
							<td
								style="background:linear-gradient(135deg,#dc2626,#991b1b);
								padding:40px;text-align:center;">

								<div style="
									width:80px;
									height:80px;
									border-radius:50%;
									background:rgba(255,255,255,0.2);
									line-height:80px;
									font-size:38px;
									margin:0 auto 20px;">
									❤️
								</div>

								<h1 style="
									margin:0;
									color:#fff;
									font-size:30px;
									font-weight:700;">
									Welcome to BloodDonate
								</h1>

								<p style="
									margin-top:12px;
									color:rgba(255,255,255,0.9);
									font-size:15px;">
									Your journey to saving lives starts today
								</p>
							</td>
						</tr>

						<!-- Greeting -->
						<tr>
							<td style="padding:40px 35px 25px;">

								<h2 style="
									margin:0 0 15px;
									color:#111827;
									font-size:24px;">
									Hello, ${donor.name} 👋
								</h2>

								<p style="
									margin:0;
									color:#6b7280;
									line-height:1.8;
									font-size:15px;">
									Thank you for registering as a blood donor.
									Your generosity can help save lives and bring
									hope to people in urgent need.
								</p>
							</td>
						</tr>

						<!-- Donor Card -->
						<tr>
							<td style="padding:0 35px 30px;">

								<div style="
									background:#fef2f2;
									border:1px solid #fecaca;
									border-radius:12px;
									padding:25px;">

									<h3 style="
										margin:0 0 18px;
										color:#991b1b;
										font-size:18px;">
										🩸 Your Donor Profile
									</h3>

									<table width="100%" cellspacing="0" cellpadding="0">

										<tr>
											<td style="padding:10px 0;color:#6b7280;">
												Blood Type
											</td>
											<td style="
												padding:10px 0;
												text-align:right;
												font-weight:700;
												color:#dc2626;">
												${donor.bloodType}
											</td>
										</tr>

										<tr>
											<td style="padding:10px 0;color:#6b7280;">
												Email
											</td>
											<td style="
												padding:10px 0;
												text-align:right;
												color:#111827;">
												${donor.email}
											</td>
										</tr>
									</table>
								</div>

							</td>
						</tr>

						<!-- Info Section -->
						<tr>
							<td style="padding:0 35px 35px;">

								<div style="
									background:#f9fafb;
									border-radius:12px;
									padding:24px;">

									<h3 style="
										margin:0 0 15px;
										color:#111827;">
										What Happens Next?
									</h3>

									<p style="
										margin:0 0 12px;
										color:#6b7280;
										line-height:1.7;">
										✅ Your donor profile is active
									</p>

									<p style="
										margin:0 0 12px;
										color:#6b7280;
										line-height:1.7;">
										🔔 You'll receive notifications when your blood type is needed
									</p>

									<p style="
										margin:0;
										color:#6b7280;
										line-height:1.7;">
										❤️ Every donation has the power to save lives
									</p>

								</div>

							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td style="
								background:#f9fafb;
								padding:25px;
								text-align:center;
								border-top:1px solid #e5e7eb;">

								<p style="
									margin:0 0 8px;
									color:#9ca3af;
									font-size:13px;">
									© ${new Date().getFullYear()} BloodDonate. All rights reserved.
								</p>

								<p style="
									margin:0;
									color:#9ca3af;
									font-size:12px;">
									This is an automated email. Please do not reply.
								</p>

							</td>
						</tr>

					</table>

				</td>
			</tr>
		</table>

	</body>
	</html>
	`;

	return { subject, html };
};

export const organizationRegistrationEmailTemplate = (org) => {
	const subject = "Organization Registration Received - Pending Admin Approval";
	const html = ` <!DOCTYPE html> <html> <head> <meta charset="UTF-8" /> <title>Registration Pending</title> </head> <body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;"> <table width="100%" cellpadding="0" cellspacing="0"> <tr> <td align="center" style="padding:40px 20px;"> <table width="600" style="background:#fff; border-radius:12px; overflow:hidden;"> <!-- Header --> <tr> <td style="background:#7c3aed; padding:40px; text-align:center; color:#fff;"> <h1 style="margin:0;">🏥 Blood Donation System</h1> <p style="margin-top:10px;">Organization Registration Received</p> </td> </tr> <!-- Body --> <tr> <td style="padding:40px;"> <h2 style="margin-top:0;">Hello ${org.name},</h2> <p style="color:#4b5563; line-height:1.6;"> Thank you for registering your organization on our platform. We have successfully received your application. </p> <!-- Status Box --> <div style=" background:#fef3c7; border-left:4px solid #f59e0b; padding:20px; margin:25px 0; border-radius:8px; "> <h3 style="margin:0; color:#92400e;"> ⏳ Pending Admin Verification </h3> <p style="margin:8px 0 0; color:#78350f;"> Your organization is currently under review. This process usually takes 24–48 hours. </p> </div> <!-- Info --> <p style="color:#374151;"> You will be notified by email once your account is approved. After approval, you will be able to: </p> <ul style="color:#4b5563;"> <li>Post blood donation requests</li> <li>Manage hospital/organization profile</li> <li>Reach verified donors instantly</li> </ul> <!-- CTA --> <div style="margin-top:30px; text-align:center;"> <p style="color:#9ca3af;"> If you have questions, contact our support team. </p> </div> </td> </tr> <!-- Footer --> <tr> <td style="text-align:center; padding:20px; background:#f9fafb; border-top:1px solid #e5e7eb;"> <p style="margin:0; font-size:12px; color:#9ca3af;"> © ${new Date().getFullYear()} Blood Donation System </p> <p style="margin:5px 0 0; font-size:12px; color:#9ca3af;"> This is an automated email. Please do not reply. </p> </td> </tr> </table> </td> </tr> </table> </body> </html> `;
	return { subject, html };
};

export const organizationStatusUpdateTemplate = (org) => {
	const subject = `Organization Account ${org.status.toUpperCase()} - Blood Donation System`;

	const statusColor = org.status === "approved" ? "#16a34a" : org.status === "rejected" ? "#dc2626" : "#f59e0b";

	const statusIcon = org.status === "approved" ? "✅" : org.status === "rejected" ? "❌" : "⏳";

	const html = `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8" />
		<title>Status Update</title>
	</head>

	<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">

		<table width="100%" cellpadding="0" cellspacing="0">
			<tr>
				<td align="center" style="padding:40px 20px;">

					<table width="600" style="background:#ffffff; border-radius:12px; overflow:hidden;">

						<!-- Header -->
						<tr>
							<td style="background:${statusColor}; padding:40px; text-align:center; color:#fff;">
								<h1 style="margin:0;">${statusIcon} Status Update</h1>
								<p style="margin-top:10px;">Blood Donation Organization</p>
							</td>
						</tr>

						<!-- Body -->
						<tr>
							<td style="padding:40px;">

								<h2 style="margin-top:0;">Hello ${org.name},</h2>

								<p style="color:#4b5563; line-height:1.6;">
									We have reviewed your organization application.
									Your account status has been updated.
								</p>

								<!-- Status Box -->
								<div style="
									background:${statusColor}20;
									border-left:4px solid ${statusColor};
									padding:20px;
									border-radius:8px;
									margin:25px 0;
								">
									<h3 style="margin:0; color:${statusColor};">
										Account Status: ${org.status.toUpperCase()}
									</h3>
								</div>

								<!-- Reason -->
								${
									org.reason
										? `
									<div style="margin-top:20px; padding:15px; background:#fef2f2; border-radius:8px;">
										<h4 style="margin:0 0 8px; color:#991b1b;">Reason:</h4>
										<p style="margin:0; color:#4b5563;">${org.reason}</p>
									</div>
								`
										: ""
								}

								<!-- Message -->
								<div style="margin-top:30px;">
									${
										org.status === "approved"
											? `<p style="color:#16a34a;">
												🎉 Congratulations! Your organization is now active. You can start posting blood donation requests.
											</p>`
											: org.status === "rejected"
											? `<p style="color:#dc2626;">
												Your application was not approved. Please review the reason above and reapply if needed.
											</p>`
											: `<p style="color:#f59e0b;">
												Your application is still under review.
											</p>`
									}
								</div>

							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td style="text-align:center; padding:20px; background:#f9fafb;">
								<p style="margin:0; font-size:12px; color:#9ca3af;">
									© ${new Date().getFullYear()} Blood Donation System
								</p>
							</td>
						</tr>

					</table>

				</td>
			</tr>
		</table>

	</body>
	</html>
	`;

	return { subject, html };
};

export const broadcastEmailTemplate = ({ subject, message }) => {
	const emailSubject = `📢 ${subject} - Blood Donation System`;

	const html = `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>${subject}</title>
	</head>

	<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,sans-serif;">

		<table width="100%" cellpadding="0" cellspacing="0">
			<tr>
				<td align="center" style="padding:40px 20px;">

					<table width="600" style="background:#ffffff; border-radius:12px; overflow:hidden;">

						<!-- Header -->
						<tr>
							<td style="background:#dc2626; padding:40px; text-align:center; color:white;">
								<h1 style="margin:0;">📢 Announcement</h1>
								<p style="margin-top:10px;">Blood Donation System</p>
							</td>
						</tr>

						<!-- Body -->
						<tr>
							<td style="padding:40px;">

								<h2 style="margin-top:0; color:#111827;">
									${subject}
								</h2>

								<div style="
									background:#fef2f2;
									border-left:4px solid #dc2626;
									padding:20px;
									border-radius:8px;
									margin-top:20px;
								">
									<p style="margin:0; color:#4b5563; font-size:15px; line-height:1.6;">
										${message}
									</p>
								</div>

								<p style="margin-top:30px; color:#6b7280;">
									Please stay updated with your donor dashboard for more details.
								</p>

							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td style="text-align:center; padding:20px; background:#f9fafb;">
								<p style="margin:0; font-size:12px; color:#9ca3af;">
									© ${new Date().getFullYear()} Blood Donation System
								</p>
							</td>
						</tr>

					</table>

				</td>
			</tr>
		</table>

	</body>
	</html>
	`;

	return { subject: emailSubject, html };
};
