import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "All"];

export default function CreateCampaign() {
	const navigate = useNavigate();
	const [selectedBTs, setSelectedBTs] = useState([]);
	const [btTouched, setBtTouched] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();

	const startDate = watch("startDate");

	const toggleBT = (bt) => {
		setBtTouched(true);
		setSelectedBTs((prev) => (prev.includes(bt) ? prev.filter((x) => x !== bt) : [...prev, bt]));
	};

	const onSubmit = async (data) => {
		if (!selectedBTs.length) {
			setBtTouched(true);
			return toast.error("Please select at least one target blood type");
		}
		const fd = new FormData();
		Object.entries(data).forEach(([k, v]) => fd.append(k, v));
		fd.append("targetBloodTypes", JSON.stringify(selectedBTs));
		if (imageFile) fd.append("image", imageFile);
		try {
			const res = await axios.post("/api/campaigns", fd, { headers: { "Content-Type": "multipart/form-data" } });
			toast.success(`Campaign created! ${res.data.emailSentTo} donors notified.`);
			navigate("/organization/campaigns");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to create campaign. Please try again.");
		}
	};

	const nowDateTimeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Create Campaign</h1>
			<div className="card p-8">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<div>
						<label className="label">Campaign Title *</label>
						<input {...register("title", { required: "Campaign title is required" })} className="input-field" placeholder="e.g. Annual Blood Drive 2025" />
						{errors.title && <p className="text-red-500 text-xs mt-1 font-sans">{errors.title.message}</p>}
					</div>

					<div>
						<label className="label">Description *</label>
						<textarea {...register("description", { required: "Campaign description is required" })} rows={3} className="input-field resize-none" placeholder="Describe the campaign goals, schedule, and what donors can expect..." />
						{errors.description && <p className="text-red-500 text-xs mt-1 font-sans">{errors.description.message}</p>}
					</div>

					<div>
						<label className="label">Target Blood Types *</label>
						<div className="flex flex-wrap gap-2">
							{BLOOD_TYPES.map((bt) => (
								<button key={bt} type="button" onClick={() => toggleBT(bt)} className={`px-3 py-1.5 rounded-lg text-sm font-bold font-sans border-2 transition-all ${selectedBTs.includes(bt) ? "bg-crimson border-crimson text-white" : "border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson"}`}>
									{bt}
								</button>
							))}
						</div>
						{btTouched && !selectedBTs.length && <p className="text-red-500 text-xs mt-1 font-sans">Please select at least one blood type</p>}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Start Date *</label>
							<input
								{...register("startDate", {
									required: "Start date is required",
									validate: (value) => {
										if (!value) return "Start date is required";
										if (new Date(value) < new Date()) return "Start date cannot be in the past";
										return true;
									},
								})}
								type="datetime-local"
								className="input-field"
								min={nowDateTimeLocal}
							/>
							{errors.startDate && <p className="text-red-500 text-xs mt-1 font-sans">{errors.startDate.message}</p>}
						</div>
						<div>
							<label className="label">End Date *</label>
							<input
								{...register("endDate", {
									required: "End date is required",
									validate: (value) => {
										if (!value) return "End date is required";
										if (startDate && new Date(value) <= new Date(startDate)) return "End date must be after the start date";
										return true;
									},
								})}
								type="datetime-local"
								className="input-field"
								min={startDate || nowDateTimeLocal}
							/>
							{errors.endDate && <p className="text-red-500 text-xs mt-1 font-sans">{errors.endDate.message}</p>}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Venue *</label>
							<input {...register("venue", { required: "Venue is required" })} className="input-field" placeholder="Hall name or location" />
							{errors.venue && <p className="text-red-500 text-xs mt-1 font-sans">{errors.venue.message}</p>}
						</div>
						<div>
							<label className="label">City *</label>
							<input
								{...register("city", {
									required: "City is required",
									maxLength: { value: 50, message: "City name must not exceed 50 characters" },
								})}
								className="input-field"
								placeholder="City"
							/>
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Target Units</label>
							<input
								{...register("targetUnits", {
									min: { value: 1, message: "Target units must be at least 1" },
									max: { value: 10000, message: "Target units seems unrealistically high" },
								})}
								type="number"
								placeholder="e.g. 50"
								min="1"
								onKeyDown={(e) => {
									if (e.key === "-" || e.key === "e") {
										e.preventDefault();
									}
								}}
								className="input-field [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
							{errors.targetUnits && <p className="text-red-500 text-xs mt-1 font-sans">{errors.targetUnits.message}</p>}
						</div>
						<div>
							<label className="label">Points Reward per Donation</label>
							<input
								{...register("pointsReward", {
									min: { value: 1, message: "Points reward must be at least 1" },
								})}
								type="number"
								className="input-field"
								placeholder="e.g. 10"
								min="1"
								onKeyDown={(e) => {
									if (e.key === "-" || e.key === "e") {
										e.preventDefault();
									}
								}}
							/>
							{errors.pointsReward && <p className="text-red-500 text-xs mt-1 font-sans">{errors.pointsReward.message}</p>}
						</div>
					</div>

					<div>
						<label className="label">Requirements</label>
						<textarea {...register("requirements")} rows={2} className="input-field resize-none" placeholder="e.g. Age 18–60, minimum weight 60 kg, no recent illness..." />
					</div>

					<div>
						<label className="label">Contact Phone</label>
						<input
							{...register("contactInfo", {
								pattern: {
									value: /^(97|98)\d{8}$/,
									message: "Enter a valid Nepali phone number (e.g. 98XXXXXXXX)",
								},
							})}
							type="tel"
							className="input-field"
							placeholder="98XXXXXXXX — for donor queries"
						/>
						{errors.contactInfo && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactInfo.message}</p>}
					</div>

					<div>
						<label className="label">Campaign Image</label>
						<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" />
						{imageFile && <p className="text-green-600 text-xs mt-1 font-sans">Selected: {imageFile.name}</p>}
					</div>

					<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm font-sans text-blue-700">Donors with matching blood types will receive an email notification when you create this campaign.</div>

					<button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
						{isSubmitting ? "Creating..." : "Create Campaign & Notify Donors"}
					</button>
				</form>
			</div>
		</div>
	);
}
