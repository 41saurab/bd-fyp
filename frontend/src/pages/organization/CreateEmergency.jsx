import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Zap, LocateFixed, Loader2, MapPin, CheckCircle } from "lucide-react";
import useGeolocation from "../../hooks/useGeolocation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function CreateEmergency() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;
	const [loadingExisting, setLoadingExisting] = useState(isEdit);
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({ defaultValues: { urgencyLevel: "urgent" } });

	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();
	const [locationPinned, setLocationPinned] = useState(false);

	const handlePinLocation = () => {
		requestLocation();
	};

	React.useEffect(() => {
		if (coords && !locationPinned) {
			setValue("latitude", coords.latitude);
			setValue("longitude", coords.longitude);
			setLocationPinned(true);
			toast.success("Location pinned! Donors near this point will be prioritized.");
		}
	}, [coords, locationPinned, setValue]);

	React.useEffect(() => {
		if (!isEdit) return;
		axios
			.get(`/api/emergency/${id}`)
			.then((r) => {
				const req = r.data;
				reset({
					patientName: req.patientName,
					bloodType: req.bloodType,
					unitsNeeded: req.unitsNeeded,
					urgencyLevel: req.urgencyLevel,
					reason: req.reason,
					location: req.location,
					city: req.city,
					contactPerson: req.contactPerson,
					contactPhone: req.contactPhone,
					deadline: req.deadline ? new Date(req.deadline).toISOString().slice(0, 16) : "",
					additionalNotes: req.additionalNotes || "",
					latitude: req.geoLocation?.coordinates?.[1] || "",
					longitude: req.geoLocation?.coordinates?.[0] || "",
				});
				if (req.geoLocation?.coordinates?.length) setLocationPinned(true);
			})
			.catch(() => {
				toast.error("Could not load this emergency request.");
				navigate("/organization/emergency");
			})
			.finally(() => setLoadingExisting(false));
	}, [id, isEdit, reset, navigate]);

	const onSubmit = async (data) => {
		try {
			if (isEdit) {
				await axios.put(`/api/emergency/${id}`, data);
				toast.success("Emergency request updated.");
			} else {
				const res = await axios.post("/api/emergency", data);
				toast.success(`Emergency posted! ${res.data.data?.emailSentTo ?? 0} donors notified.`);
			}
			navigate("/organization/emergency");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to save emergency request.");
		}
	};

	const nowDateTimeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

	if (loadingExisting) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto px-6 py-10">
			<div className="flex items-center gap-3 mb-8">
				<div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
					<Zap className="w-5 h-5 text-crimson" />
				</div>
				<h1 className="text-3xl font-display font-bold text-stone-800">{isEdit ? "Edit Emergency Request" : "Post Emergency Request"}</h1>
			</div>

			{!isEdit && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm font-sans text-red-700">This will immediately send emergency emails to all compatible donors in your area.</div>}
			{isEdit && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm font-sans text-amber-700">Editing will not re-send notification emails to donors who already responded.</div>}

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
									min: { value: 1, message: "At least 1 unit required" },
									max: { value: 50, message: "Units seems too high — verify" },
								})}
								type="number"
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
						<input {...register("reason", { required: "Reason is required" })} className="input-field" placeholder="e.g. Emergency surgery, accident trauma" />
						{errors.reason && <p className="text-red-500 text-xs mt-1 font-sans">{errors.reason.message}</p>}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Location / Hospital *</label>
							<input {...register("location", { required: "Location is required" })} className="input-field" placeholder="Hospital name & ward" />
							{errors.location && <p className="text-red-500 text-xs mt-1 font-sans">{errors.location.message}</p>}
						</div>
						<div>
							<label className="label">City *</label>
							<input
								{...register("city", {
									required: "City is required",
									maxLength: { value: 50, message: "City name too long" },
								})}
								className="input-field"
								placeholder="e.g. Kathmandu"
							/>
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<p className="text-sm font-sans font-semibold text-stone-700 mb-2 flex items-center gap-2">
							<MapPin className="w-4 h-4 text-blue-500" />
							Pin Hospital Location (Recommended)
						</p>
						<p className="text-xs text-stone-500 font-sans mb-3">Sharing your coordinates lets us notify donors who are physically nearby — not just in the same city.</p>

						{locationPinned ? (
							<div className="flex items-center gap-2 text-green-700 text-sm font-sans">
								<CheckCircle className="w-4 h-4" />
								{coords ? `Location pinned (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})` : "Location saved on this request"}
								<button
									type="button"
									onClick={() => {
										setLocationPinned(false);
										setValue("latitude", "");
										setValue("longitude", "");
									}}
									className="ml-auto text-xs text-stone-400 hover:text-red-500"
								>
									Remove
								</button>
							</div>
						) : (
							<button type="button" onClick={handlePinLocation} disabled={geoLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-sans text-blue-700 hover:bg-blue-50 transition disabled:opacity-60">
								{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
								{geoLoading ? "Getting location…" : "Use My Current Location"}
							</button>
						)}

						{geoError && <p className="text-orange-600 text-xs mt-2 font-sans">{geoError}</p>}

						<input type="hidden" {...register("latitude")} />
						<input type="hidden" {...register("longitude")} />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">Contact Person *</label>
							<input {...register("contactPerson", { required: "Contact person required" })} className="input-field" placeholder="Name to reach" />
							{errors.contactPerson && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPerson.message}</p>}
						</div>
						<div>
							<label className="label">Contact Phone *</label>
							<input
								{...register("contactPhone", {
									required: "Phone number required",
									pattern: {
										value: /^(97|98)\d{8}$/,
										message: "Enter a valid Nepali number (98XXXXXXXX)",
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
								validate: (v) => !v || new Date(v) > new Date() || "Deadline cannot be in the past",
							})}
							type="datetime-local"
							className="input-field"
							min={nowDateTimeLocal}
						/>
						{errors.deadline && <p className="text-red-500 text-xs mt-1 font-sans">{errors.deadline.message}</p>}
					</div>

					<div>
						<label className="label">Additional Notes</label>
						<textarea {...register("additionalNotes")} rows={2} className="input-field resize-none" placeholder="e.g. Report to reception desk, bring ID…" />
					</div>

					<button type="submit" disabled={isSubmitting} className="w-full py-3 bg-crimson hover:bg-blood-800 text-white font-sans font-semibold rounded-lg transition-colors text-base">
						{isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "🚨 Post Emergency & Notify Donors"}
					</button>
				</form>
			</div>
		</div>
	);
}
