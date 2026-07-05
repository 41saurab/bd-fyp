import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function CreateEmergency() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: { urgencyLevel: "urgent" },
	});

	const onSubmit = async (data) => {
		try {
			const res = await axios.post("/api/emergency", data);
			toast.success(`Emergency posted! ${res.data.emailSentTo} donors notified.`);
			navigate("/organization/emergency");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to post emergency request. Please try again.");
		}
	};

	const nowDateTimeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

	return (
		<div className="max-w-xl mx-auto px-6 py-10">
			<div className="flex items-center gap-3 mb-8">
				<div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
					<Zap className="w-5 h-5 text-crimson" />
				</div>
				<h1 className="text-3xl font-display font-bold text-stone-800">Post Emergency Request</h1>
			</div>

			<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm font-sans text-red-700">This will immediately send emergency emails to all compatible donors.</div>

			<div className="card p-8">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Patient Name *</label>
							<input {...register("patientName", { required: "Patient name is required" })} className="input-field" placeholder="Full name of patient" />
							{errors.patientName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.patientName.message}</p>}
						</div>
						<div>
							<label className="label">Blood Type Needed *</label>
							<select {...register("bloodType", { required: "Blood type is required" })} className="input-field">
								<option value="">Select blood type</option>
								{BLOOD_TYPES.map((bt) => (
									<option key={bt} value={bt}>
										{bt}
									</option>
								))}
							</select>
							{errors.bloodType && <p className="text-red-500 text-xs mt-1 font-sans">{errors.bloodType.message}</p>}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Units Needed *</label>
							<input
								{...register("unitsNeeded", {
									required: "Number of units needed is required",
									valueAsNumber: true,
									min: { value: 1, message: "At least 1 unit must be requested" },
									max: { value: 50, message: "Units requested seems unusually high — please verify" },
								})}
								onKeyDown={(e) => {
									if (e.key === "-" || e.key === "e") {
										e.preventDefault();
									}
								}}
								className="input-field"
								min="1"
								max="50"
								placeholder="e.g. 2"
							/>
							{errors.unitsNeeded && <p className="text-red-500 text-xs mt-1 font-sans">{errors.unitsNeeded.message}</p>}
						</div>
						<div>
							<label className="label">Urgency Level</label>
							<select {...register("urgencyLevel")} className="input-field">
								<option value="critical">Critical — life-threatening</option>
								<option value="urgent">Urgent — needed within hours</option>
								<option value="moderate">Moderate — needed within a day</option>
							</select>
						</div>
					</div>

					<div>
						<label className="label">Reason / Diagnosis *</label>
						<input {...register("reason", { required: "Reason or diagnosis is required" })} className="input-field" placeholder="e.g. Emergency surgery, accident trauma, childbirth complication" />
						{errors.reason && <p className="text-red-500 text-xs mt-1 font-sans">{errors.reason.message}</p>}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Location / Hospital *</label>
							<input {...register("location", { required: "Hospital or location name is required" })} className="input-field" placeholder="Hospital name & ward / room" />
							{errors.location && <p className="text-red-500 text-xs mt-1 font-sans">{errors.location.message}</p>}
						</div>
						<div>
							<label className="label">City *</label>
							<input
								{...register("city", {
									required: "City is required",
									maxLength: { value: 50, message: "City name must not exceed 50 characters" },
								})}
								className="input-field"
								placeholder="e.g. Kathmandu"
							/>
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Contact Person *</label>
							<input {...register("contactPerson", { required: "Contact person name is required" })} className="input-field" placeholder="Name of person to reach" />
							{errors.contactPerson && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPerson.message}</p>}
						</div>
						<div>
							<label className="label">Contact Phone *</label>
							<input
								{...register("contactPhone", {
									required: "Contact phone number is required",
									pattern: {
										value: /^(97|98)\d{8}$/,
										message: "Enter a valid Nepali phone number (e.g. 98XXXXXXXX)",
									},
								})}
								type="tel"
								className="input-field"
								placeholder="98XXXXXXXX"
							/>
							{errors.contactPhone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPhone.message}</p>}
						</div>
					</div>

					<div>
						<label className="label">Deadline</label>
						<input
							{...register("deadline", {
								validate: (value) => {
									if (!value) return true; 
									if (new Date(value) < new Date()) return "Deadline cannot be in the past";
									return true;
								},
							})}
							type="datetime-local"
							className="input-field"
							min={nowDateTimeLocal}
						/>
						{errors.deadline && <p className="text-red-500 text-xs mt-1 font-sans">{errors.deadline.message}</p>}
					</div>

					<div>
						<label className="label">Additional Notes</label>
						<textarea {...register("additionalNotes")} rows={2} className="input-field resize-none" placeholder="Any additional details for donors (e.g. report to reception desk, bring ID)..." />
					</div>

					<button type="submit" disabled={isSubmitting} className="w-full py-3 bg-crimson hover:bg-blood-800 text-white font-sans font-semibold rounded-lg transition-colors text-base">
						{isSubmitting ? "Posting..." : "🚨 Post Emergency & Notify Donors"}
					</button>
				</form>
			</div>
		</div>
	);
}
