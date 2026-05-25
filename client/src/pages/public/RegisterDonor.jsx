import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterDonor() {
	const navigate = useNavigate();
	const [showPass, setShowPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);
	const [selectedBT, setSelectedBT] = useState("");
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();

	const password = watch("password");

	const onSubmit = async (data) => {
		if (!selectedBT) return toast.error("Please select your blood type");
		try {
			await axios.post("/api/auth/register/donor", { ...data, bloodType: selectedBT });
			toast.success("Registration successful! Welcome to Raktabindu!");
			navigate("/login");
		} catch (err) {
			toast.error(err.response?.data?.message || "Registration failed");
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
											message: "Enter first and last name",
										},
									})}
									className="input-field"
									placeholder="Enter full name"
								/>
								{errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
							</div>
							<div>
								<label className="label">Phone Number *</label>
								<input
									{...register("phone", {
										required: "Phone number is required",
										pattern: {
											value: /^[0-9]{10}$/,
											message: "Phone number must be 10 digits",
										},
									})}
									type="tel"
									className="input-field"
									placeholder="98XXXXXXXX"
								/>
								{errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
							</div>
						</div>
						<div>
							<label className="label">Email Address *</label>
							<input
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: "Invalid email address",
									},
								})}
								className="input-field"
								placeholder="Enter email"
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
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
										type={showPass ? "text" : "password"}
										className="input-field pr-10"
										placeholder="Enter password"
									/>
									<button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
										{!showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
								{errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
							</div>
							<div>
								<label className="label">Confirm Password *</label>
								<div className="relative">
									<input
										{...register("confirmPassword", {
											required: "Confirm password is required",
											validate: (value) => value === password || "Passwords do not match",
										})}
										type={showConfirmPass ? "text" : "password"}
										className="input-field pr-10"
										placeholder="Enter confirm password"
									/>
									<button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
										{!showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
								{errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
							</div>
						</div>
						<div>
							<label className="label">City *</label>
							<input {...register("city", { required: "City is required" })} className="input-field" placeholder="Enter city" />
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>

						{/* Blood Type Selector */}
						<div>
							<label className="label">Blood Type *</label>
							<div className="grid grid-cols-4 gap-2">
								{BLOOD_TYPES.map((bt) => (
									<button key={bt} type="button" onClick={() => setSelectedBT(bt)} className={`py-3 rounded-xl text-sm font-bold font-sans border-2 transition-all ${selectedBT === bt ? "bg-crimson border-crimson text-white shadow-blood" : "border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson"}`}>
										{bt}
									</button>
								))}
							</div>
							{!selectedBT && <p className="text-stone-400 text-xs mt-1 font-sans">Please select your blood type</p>}
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="label">Date of Birth *</label>
								<input {...register("dateOfBirth", { required: "Date of birth is required" })} type="date" className="input-field" />
								{errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 font-sans">{errors.dateOfBirth.message}</p>}
							</div>
							<div>
								<label className="label">Gender *</label>
								<select {...register("gender", { required: "Gender is required" })} className="input-field">
									<option value="">Select</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="other">Other</option>
								</select>
								{errors.gender && <p className="text-red-500 text-xs mt-1 font-sans">{errors.gender.message}</p>}
							</div>
							<div>
								<label className="label">Weight (kg)</label>
								<input
									{...register("weight", {
										required: "Weight is required",
										valueAsNumber: true,
										min: {
											value: 60,
											message: "Weight must be at least 60kg",
										},
									})}
									type="number"
									className="input-field"
									placeholder="60"
								/>
								{errors.weight && <p className="text-red-500 text-xs mt-1 font-sans">{errors.weight.message}</p>}
							</div>
						</div>

						{/* Benefits */}
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
							{isSubmitting ? "Creating Account..." : "Create Donor Account"}
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
