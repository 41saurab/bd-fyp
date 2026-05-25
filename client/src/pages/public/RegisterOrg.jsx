import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_DOC_SIZE_MB = 5;

export default function RegisterOrg() {
	const navigate = useNavigate();
	const [showPass, setShowPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);
	const [docFile, setDocFile] = useState(null);
	const [docError, setDocError] = useState("");
	const [docTouched, setDocTouched] = useState(false);
	const [success, setSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm();
	const password = watch("password");

	const handleDocUpload = (e) => {
		const file = e.target.files[0];
		setDocTouched(true);
		if (!file) return;

		if (!ALLOWED_DOC_TYPES.includes(file.type)) {
			setDocError("Only JPG or PNG files are accepted");
			setDocFile(null);
			return;
		}
		if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
			setDocError(`File must be under ${MAX_DOC_SIZE_MB} MB`);
			setDocFile(null);
			return;
		}
		setDocError("");
		setDocFile(file);
	};

	const onSubmit = async (data) => {
		if (!docFile) {
			setDocTouched(true);
			setDocError("Legal registration document is required");
			return toast.error("Please upload your legal registration document before submitting");
		}

		const formData = new FormData();
		Object.entries(data).forEach(([k, v]) => formData.append(k, v));
		formData.append("legalDocument", docFile);

		try {
			await axios.post("/api/auth/register/organization", formData, { headers: { "Content-Type": "multipart/form-data" } });
			setSuccess(true);
		} catch (err) {
			toast.error(err.response?.data?.message || "Registration failed. Please try again.");
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
				<div className="max-w-md text-center">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-10 h-10 text-green-500" />
					</div>
					<h2 className="text-2xl font-display font-bold text-stone-800 mb-3">Registration Submitted!</h2>
					<div className="card p-6 mb-6">
						<div className="flex items-center gap-3 mb-3">
							<Clock className="w-5 h-5 text-orange-500" />
							<p className="text-sm font-sans font-semibold text-stone-700">Under Review (24–48 hours)</p>
						</div>
						<p className="text-sm text-stone-500 font-body">Our admin team will review your legal documents and approve your account. You'll receive an email notification once approved.</p>
					</div>
					<Link to="/login" className="btn-primary w-full block text-center">
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

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
					<h1 className="text-3xl font-display font-bold text-stone-800 mb-2">Register Organization</h1>
					<p className="text-stone-500 font-body">Hospitals, blood banks, and NGOs — join our network</p>
				</div>

				<div className="card p-8">
					<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
						<Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-sans font-semibold text-amber-800">Approval Required</p>
							<p className="text-xs text-amber-700 font-sans mt-0.5">Registration requires admin approval. Upload your legal registration document to speed up the process.</p>
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						{/* Account Information */}
						<div className="border-b border-stone-100 pb-5">
							<h3 className="text-sm font-sans font-semibold text-stone-700 uppercase tracking-wide mb-4">Account Information</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="label">Contact Person Name *</label>
									<input
										{...register("name", {
											required: "Contact person name is required",
											minLength: {
												value: 2,
												message: "Name must be at least 2 characters",
											},
											maxLength: {
												value: 100,
												message: "Name must not exceed 100 characters",
											},
										})}
										className="input-field"
										placeholder="Enter contact person name"
									/>
									{errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
								</div>
								<div>
									<label className="label">Email Address *</label>
									<input
										{...register("email", {
											required: "Email address is required",
											pattern: {
												value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
												message: "Please enter a valid email address",
											},
										})}
										className="input-field"
										placeholder="Enter email address"
										type="email"
									/>
									{errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
								</div>
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
												maxLength: {
													value: 72,
													message: "Password must not exceed 72 characters",
												},
											})}
											type={showPass ? "text" : "password"}
											className="input-field pr-10"
											placeholder="Enter password"
										/>
										<button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
											{showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
												validate: (value) => value === password || "Passwords do not match",
											})}
											type={showConfirmPass ? "text" : "password"}
											className="input-field pr-10"
											placeholder="Re-enter password"
										/>
										<button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
											{showConfirmPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
										</button>
									</div>
									{errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
								</div>
							</div>
							<div className="mt-4">
								<label className="label">Phone Number *</label>
								<input
									type="tel"
									{...register("phone", {
										required: "Phone number is required",
										pattern: {
											value: /^(97|98)\d{8}$/,
											message: "Enter a valid Nepali phone number (e.g. 98XXXXXXXX)",
										},
									})}
									className="input-field"
									placeholder="98XXXXXXXX"
								/>
								{errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
							</div>
						</div>

						{/* Organization Details */}
						<div>
							<h3 className="text-sm font-sans font-semibold text-stone-700 uppercase tracking-wide mb-4">Organization Details</h3>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="label">Organization Name *</label>
										<input
											{...register("orgName", {
												required: "Organization name is required",
												minLength: {
													value: 3,
													message: "Organization name must be at least 3 characters",
												},
												maxLength: {
													value: 150,
													message: "Organization name must not exceed 150 characters",
												},
											})}
											className="input-field"
											placeholder="Enter organization name"
										/>
										{errors.orgName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.orgName.message}</p>}
									</div>
									<div>
										<label className="label">Organization Type *</label>
										<select
											{...register("orgType", {
												required: "Please select an organization type",
											})}
											className="input-field"
										>
											<option value="">Select type</option>
											<option value="hospital">Hospital</option>
											<option value="blood_bank">Blood Bank</option>
											<option value="clinic">Clinic</option>
											<option value="ngo">NGO</option>
											<option value="other">Other</option>
										</select>
										{errors.orgType && <p className="text-red-500 text-xs mt-1 font-sans">{errors.orgType.message}</p>}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="label">PAN Number *</label>
										<input
											{...register("registrationNumber", {
												required: "PAN number is required",
												pattern: {
													value: /^[0-9]{9}$/,
													message: "PAN number must be exactly 9 digits",
												},
											})}
											className="input-field"
											placeholder="Enter 9-digit PAN number"
											maxLength={9}
										/>
										{errors.registrationNumber && <p className="text-red-500 text-xs mt-1 font-sans">{errors.registrationNumber.message}</p>}
									</div>
									<div>
										<label className="label">City *</label>
										<input
											{...register("city", {
												required: "City is required",
												maxLength: {
													value: 50,
													message: "City name must not exceed 50 characters",
												},
											})}
											className="input-field"
											placeholder="Enter city"
										/>
										{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
									</div>
								</div>
								<div>
									<label className="label">Address *</label>
									<input
										{...register("address", {
											required: "Address is required",
											maxLength: {
												value: 200,
												message: "Address must not exceed 200 characters",
											},
										})}
										className="input-field"
										placeholder="Enter full address"
									/>
									{errors.address && <p className="text-red-500 text-xs mt-1 font-sans">{errors.address.message}</p>}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="label">Contact Person</label>
										<input {...register("contactPerson")} className="input-field" placeholder="Enter contact person name" />
									</div>
									<div>
										<label className="label">Contact Phone</label>
										<input
											type="tel"
											{...register("contactPhone", {
												pattern: {
													value: /^(97|98)\d{8}$/,
													message: "Enter a valid Nepali phone number (e.g. 98XXXXXXXX)",
												},
											})}
											className="input-field"
											placeholder="98XXXXXXXX"
										/>
										{errors.contactPhone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPhone.message}</p>}
									</div>
								</div>
								<div>
									<label className="label">Website</label>
									<input
										{...register("website", {
											pattern: {
												value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
												message: "Please enter a valid website URL (e.g. https://example.com)",
											},
										})}
										className="input-field"
										placeholder="e.g. https://example.com"
									/>
									{errors.website && <p className="text-red-500 text-xs mt-1 font-sans">{errors.website.message}</p>}
								</div>
								<div>
									<label className="label">Description</label>
									<textarea {...register("description")} rows={3} className="input-field resize-none" placeholder="Brief description of your organization..." />
								</div>

								<div>
									<label className="label">
										Legal Document * <span className="text-stone-400 font-normal text-xs ml-1">(Registration certificate, max 5 MB)</span>
									</label>
									<div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${docFile ? "border-green-300 bg-green-50" : docTouched && !docFile ? "border-red-300 bg-red-50" : "border-stone-200 hover:border-crimson hover:bg-red-50"}`} onClick={() => document.getElementById("doc-upload").click()}>
										<input id="doc-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleDocUpload} />
										{docFile ? (
											<div className="flex items-center justify-center gap-2 text-green-600 font-sans text-sm">
												<CheckCircle className="w-5 h-5" />
												{docFile.name}
											</div>
										) : (
											<div>
												<Upload className={`w-8 h-8 mx-auto mb-2 ${docTouched && !docFile ? "text-red-400" : "text-stone-400"}`} />
												<p className="text-sm text-stone-500 font-sans">Click to upload registration certificate or legal document</p>
												<p className="text-xs text-stone-400 font-sans mt-1">JPG or PNG — max 5 MB</p>
											</div>
										)}
									</div>
									{docError && (
										<p className="text-red-500 text-xs mt-1 font-sans flex items-center gap-1">
											<AlertCircle className="w-3 h-3" />
											{docError}
										</p>
									)}
								</div>
							</div>
						</div>

						<button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
							{isSubmitting ? "Submitting..." : "Submit for Approval"}
						</button>
					</form>
					<p className="text-center text-sm text-stone-500 mt-5 font-sans">
						Already registered?{" "}
						<Link to="/login" className="text-crimson hover:underline">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
