import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LocateFixed, Loader2, CheckCircle } from "lucide-react";
import useGeolocation from "../../hooks/useGeolocation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "All"];

const toDateTimeLocal = (d) => (d ? new Date(new Date(d).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default function CreateCampaign() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;
	const [loadingExisting, setLoadingExisting] = useState(isEdit);
	const [existingImage, setExistingImage] = useState(null);
	const [selectedBTs, setSelectedBTs] = useState([]);
	const [btTouched, setBtTouched] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [locationPinned, setLocationPinned] = useState(false);
	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();

	const startDate = watch("startDate");

	React.useEffect(() => {
		if (coords && !locationPinned) {
			setValue("latitude", coords.latitude);
			setValue("longitude", coords.longitude);
			setLocationPinned(true);
		}
	}, [coords, locationPinned, setValue]);

	React.useEffect(() => {
		if (!isEdit) return;
		axios
			.get(`/api/campaigns/${id}`)
			.then((r) => {
				const c = r.data;
				reset({
					title: c.title,
					description: c.description,
					startDate: toDateTimeLocal(c.startDate),
					endDate: toDateTimeLocal(c.endDate),
					venue: c.venue,
					city: c.city,
					targetUnits: c.targetUnits,
					pointsReward: c.pointsReward,
					requirements: c.requirements || "",
					contactInfo: c.contactInfo || "",
					latitude: c.geoLocation?.coordinates?.[1] || "",
					longitude: c.geoLocation?.coordinates?.[0] || "",
				});
				setSelectedBTs(c.targetBloodTypes || []);
				setExistingImage(c.image || null);
				if (c.geoLocation?.coordinates?.length) setLocationPinned(true);
			})
			.catch(() => {
				toast.error("Could not load this campaign.");
				navigate("/organization/campaigns");
			})
			.finally(() => setLoadingExisting(false));
	}, [id, isEdit, reset, navigate]);

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
		Object.entries(data).forEach(([k, v]) => {
			if (v !== undefined && v !== null && v !== "") fd.append(k, v);
		});
		fd.append("targetBloodTypes", JSON.stringify(selectedBTs));
		if (imageFile) fd.append("image", imageFile);
		try {
			if (isEdit) {
				await axios.put(`/api/campaigns/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
				toast.success("Campaign updated.");
			} else {
				const res = await axios.post("/api/campaigns", fd, { headers: { "Content-Type": "multipart/form-data" } });
				toast.success(`Campaign created! ${res.data.emailSentTo} donors notified.`);
			}
			navigate("/organization/campaigns");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to save campaign. Please try again.");
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
		<div className="max-w-2xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-display font-bold text-stone-800 mb-8">{isEdit ? "Edit Campaign" : "Create Campaign"}</h1>
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
										if (!isEdit && new Date(value) < new Date()) return "Start date cannot be in the past";
										return true;
									},
								})}
								type="datetime-local"
								className="input-field"
								min={isEdit ? undefined : nowDateTimeLocal}
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

					{/* Pinning the exact venue location lets us notify donors within a
					    25km radius when the campaign is created, and lets donors find it
					    through "nearby campaigns" search — without this it silently
					    falls back to a much less precise city-name text match. */}
					<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<p className="text-sm font-sans font-semibold text-stone-700 mb-1">📍 Pin Venue Location (recommended)</p>
						<p className="text-xs text-stone-500 font-sans mb-3">Use your current location if you're setting this up from the venue, or skip and we'll match donors by city only.</p>

						{locationPinned ? (
							<div className="flex items-center gap-2 text-green-700 text-sm font-sans">
								<CheckCircle className="w-4 h-4" />
								Location pinned — donors nearby will be notified precisely
							</div>
						) : (
							<button type="button" onClick={requestLocation} disabled={geoLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-sans text-blue-700 hover:bg-blue-50 transition disabled:opacity-60">
								{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
								{geoLoading ? "Getting location…" : "Use Current Location"}
							</button>
						)}

						{geoError && <p className="text-orange-600 text-xs mt-2 font-sans">{geoError} — campaign will still be created, matched by city instead.</p>}
						<input type="hidden" {...register("latitude")} />
						<input type="hidden" {...register("longitude")} />
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
						{existingImage && !imageFile && (
							<div className="mb-2 flex items-center gap-2">
								<img src={existingImage} alt="Current campaign" className="w-16 h-16 rounded-lg object-cover border border-stone-200" />
								<span className="text-xs text-stone-400 font-sans">Current image — choose a file below to replace it</span>
							</div>
						)}
						<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" />
						{imageFile && <p className="text-green-600 text-xs mt-1 font-sans">Selected: {imageFile.name}</p>}
					</div>

					<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm font-sans text-blue-700">{isEdit ? "Donors already registered won't be re-notified of these changes." : "Donors with matching blood types will receive an email notification when you create this campaign."}</div>

					<button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
						{isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Campaign & Notify Donors"}
					</button>
				</form>
			</div>
		</div>
	);
}
