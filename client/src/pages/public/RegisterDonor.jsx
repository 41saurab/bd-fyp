import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, CheckCircle, LocateFixed, Loader2 } from "lucide-react";
import useGeolocation from "../../hooks/useGeolocation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const validateAge = (value) => {
	if (!value) return "Date of birth is required";
	const dob = new Date(value);
	const today = new Date();
	const age = (today - dob) / (365.25 * 24 * 60 * 60 * 1000);
	if (dob > today) return "Date of birth cannot be in the future";
	if (age < 18) return "You must be at least 18 years old to donate blood";
	if (age > 65) return "Donors must be 65 years old or younger";
	return true;
};

export default function RegisterDonor() {
	const navigate = useNavigate();
	const [showPass, setShowPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);
	const [selectedBT, setSelectedBT] = useState("");
	const [btTouched, setBtTouched] = useState(false);
	const [locationShared, setLocationShared] = useState(false);
	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();

	const password = watch("password");

	React.useEffect(() => {
		if (coords && !locationShared) {
			setValue("latitude", Number(coords.latitude));
			setValue("longitude", Number(coords.longitude));
			setLocationShared(true);
		}
	}, [coords, locationShared, setValue]);

	const onSubmit = async (data) => {
		if (!selectedBT) {
			setBtTouched(true);
			return toast.error("Please select your blood type before continuing");
		}

		// sanitize latitude and longitude to be numbers or undefined
		const latitude = data.latitude !== undefined && data.latitude !== "" ? Number(data.latitude) : undefined;
		const longitude = data.longitude !== undefined && data.longitude !== "" ? Number(data.longitude) : undefined;

		const payload = {
			...data,
			bloodType: selectedBT,
			latitude,
			longitude,
		};

		try {
			await axios.post("/api/auth/register/donor", payload);
			toast.success("Account created! Please login to continue.");
			navigate("/login");
		} catch (err) {
			toast.error(err.response?.data?.message || "Registration failed. Please try again.");
		}
	};
	return (
		<div className="min-h-screen bg-stone-50 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<Link to="/" className="inline-flex items-center gap-2 mb-6">
						<svg viewBox="0 0 24 24" className="w-8 h-8 fill-crimson animate-heartbeat">
							<path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
						</svg>
						<span className="font-display font-bold text-2xl text-stone-800">
							Blood<span className="text-crimson">Bridge</span>
						</span>
					</Link>
					<h1 className="text-3xl font-display font-bold text-stone-800 mb-2">Register as Donor</h1>
					<p className="text-stone-500 font-body">Join thousands of heroes saving lives every day</p>
				</div>

				<div className="card p-8">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="label">Full Name *</label>
								<input
									{...register("name", {
										required: "Full name is required",
										pattern: {
											value: /^([A-Za-z]+(?:\s[A-Za-z]+){1,2})$/,
											message: "Please enter your first and last name (letters only)",
										},
									})}
									className="input-field"
									placeholder="Enter full name"
								/>
								{errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
							</div>
							<div>
								<label className="label">Phone *</label>
								<input
									{...register("phone", {
										required: "Phone number is required",
										pattern: { value: /^(97|98)\d{8}$/, message: "Enter a valid Nepali number" },
									})}
									type="tel"
									className="input-field"
									placeholder="98XXXXXXXX"
								/>
								{errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
							</div>
						</div>

						<div>
							<label className="label">Email *</label>
							<input
								{...register("email", {
									required: "Email is required",
									pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
								})}
								type="email"
								className="input-field"
								placeholder="your@email.com"
							/>
							{errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="label">Password *</label>
								<div className="relative">
									<input
										{...register("password", {
											required: "Password is required",
											minLength: { value: 8, message: "Minimum 8 characters" },
										})}
										type={showPass ? "text" : "password"}
										className="input-field pr-10"
										placeholder="Min 8 characters"
									/>
									<button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
										{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
								{errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
							</div>
							<div>
								<label className="label">Confirm Password *</label>
								<div className="relative">
									<input
										{...register("confirmPassword", {
											required: "Please confirm your password",
											validate: (v) => v === password || "Passwords do not match",
										})}
										type={showConfirmPass ? "text" : "password"}
										className="input-field pr-10"
										placeholder="Repeat password"
									/>
									<button type="button" onClick={() => setShowConfirmPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
										{showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
								{errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
							</div>
						</div>

						<div>
							<label className="label">City *</label>
							<input
								{...register("city", {
									required: "City is required",
									maxLength: { value: 50, message: "City name too long" },
								})}
								className="input-field"
								placeholder="Your city"
							/>
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>

						<div>
							<label className="label">Blood Type *</label>
							<div className="grid grid-cols-4 gap-2">
								{BLOOD_TYPES.map((bt) => (
									<button
										key={bt}
										type="button"
										onClick={() => {
											setSelectedBT(bt);
											setBtTouched(true);
										}}
										className={`py-3 rounded-xl text-sm font-bold font-sans border-2 transition-all ${selectedBT === bt ? "bg-crimson border-crimson text-white shadow-blood" : "border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson"}`}
									>
										{bt}
									</button>
								))}
							</div>
							{btTouched && !selectedBT && <p className="text-red-500 text-xs mt-1 font-sans">Please select your blood type</p>}
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="label">Date of Birth *</label>
								<input {...register("dateOfBirth", { required: "DOB required", validate: validateAge })} type="date" className="input-field" max={new Date().toISOString().split("T")[0]} />
								{errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 font-sans">{errors.dateOfBirth.message}</p>}
							</div>
							<div>
								<label className="label">Gender *</label>
								<select {...register("gender", { required: "Please select gender" })} className="input-field">
									<option value="">Select</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="other">Other</option>
								</select>
								{errors.gender && <p className="text-red-500 text-xs mt-1 font-sans">{errors.gender.message}</p>}
							</div>
							<div>
								<label className="label">Weight (kg) *</label>
								<input
									{...register("weight", {
										required: "Weight is required",
										valueAsNumber: true,
										min: { value: 60, message: "Minimum 60 kg" },
										max: { value: 300, message: "Weight too high" },
									})}
									type="number"
									className="input-field [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
									placeholder="60"
									onKeyDown={(e) => {
										if (e.key === "e" || e.key === "-") {
											e.preventDefault();
										}
									}}
								/>
								{errors.weight && <p className="text-red-500 text-xs mt-1 font-sans">{errors.weight.message}</p>}
							</div>
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
							<p className="text-sm font-sans font-semibold text-stone-700 mb-1">📍 Share Your Location (Optional)</p>
							<p className="text-xs text-stone-500 font-sans mb-3">Allows us to notify you about emergencies and campaigns near your actual location — more accurate than city-based matching.</p>

							{locationShared ? (
								<div className="flex items-center gap-2 text-green-700 text-sm font-sans">
									<CheckCircle className="w-4 h-4" />
									Location shared — you'll get proximity-based notifications
								</div>
							) : (
								<button type="button" onClick={requestLocation} disabled={geoLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-sans text-blue-700 hover:bg-blue-50 transition disabled:opacity-60">
									{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
									{geoLoading ? "Getting location…" : "Allow Location Access"}
								</button>
							)}

							{geoError && <p className="text-orange-600 text-xs mt-2 font-sans">{geoError} — you can set this later from your profile.</p>}
							{/* <input type="hidden" {...register("latitude")} />
							<input type="hidden" {...register("longitude")} /> */}
						</div>

						<div className="bg-red-50 rounded-xl p-4 border border-red-100">
							<p className="text-sm font-sans font-semibold text-stone-700 mb-2">As a donor you'll receive:</p>
							<div className="space-y-1.5">
								{["Email notifications for nearby campaigns", "Emergency alerts for matching blood type", "Points & badges for every donation", "Donation history & certificates"].map((b) => (
									<div key={b} className="flex items-center gap-2 text-sm text-stone-600 font-sans">
										<CheckCircle className="w-4 h-4 text-crimson flex-shrink-0" />
										{b}
									</div>
								))}
							</div>
						</div>

						<button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
							{isSubmitting ? "Creating Account…" : "Create Donor Account"}
						</button>
					</form>

					<p className="text-center text-sm text-stone-500 mt-5 font-sans">
						Already have an account?{" "}
						<Link to="/login" className="text-crimson hover:underline">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
