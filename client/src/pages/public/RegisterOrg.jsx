import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, Upload, CheckCircle, Clock } from "lucide-react";

export default function RegisterOrg() {
	const navigate = useNavigate();
	const [showPass, setShowPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);
	const [docFile, setDocFile] = useState(null);
	const [success, setSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();

	const onSubmit = async (data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([k, v]) => formData.append(k, v));
		if (docFile) formData.append("legalDocument", docFile);
		try {
			await axios.post("/api/auth/register/organization", formData, { headers: { "Content-Type": "multipart/form-data" } });
			setSuccess(true);
		} catch (err) {
			toast.error(err.response?.data?.message || "Registration failed");
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
							<p className="text-sm font-sans font-semibold text-stone-700">Under Review (24-48 hours)</p>
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
							<p className="text-xs text-amber-700 font-sans mt-0.5">Registration requires admin approval. Upload legal documents for faster review.</p>
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="border-b border-stone-100 pb-5">
							<h3 className="text-sm font-sans font-semibold text-stone-700 uppercase tracking-wide mb-4">Account Information</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="label">Contact Person Name *</label>
									<input {...register("name", { required: "Required" })} className="input-field" placeholder="Enter contact person name" />
									{errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
								</div>
								<div>
									<label className="label">Email Address *</label>
									<input {...register("email", { required: "Required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} className="input-field" placeholder="Enter organization email address" />
									{errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
								</div>
								<div>
									<label className="label">Password *</label>
									<div className="relative">
										<input {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} type={showPass ? "text" : "password"} className="input-field pr-10" placeholder="Min 6 chars" />
										<button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
											{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
									{errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
								</div>
								<div>
									<label className="label">Confirm Password *</label>
									<div className="relative">
										<input {...register("confirmPassword", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} type={showConfirmPass ? "text" : "password"} className="input-field pr-10" placeholder="Enter confirm password" />
										<button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
											{showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
									{errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
								</div>
							</div>
							<div>
								<label className="label">Phone *</label>
								<input type="tel" {...register("phone", { required: "Required" })} className="input-field" placeholder="Enter phone number" />
								{errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
							</div>
						</div>

						<div>
							<h3 className="text-sm font-sans font-semibold text-stone-700 uppercase tracking-wide mb-4">Organization Details</h3>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="label">Organization Name *</label>
										<input {...register("orgName", { required: "Required" })} className="input-field" placeholder="Enter organization name" />
										{errors.orgName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.orgName.message}</p>}
									</div>
									<div>
										<label className="label">Organization Type *</label>
										<select {...register("orgType", { required: "Required" })} className="input-field">
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
										<label className="label">Registration Number *</label>
										<input {...register("registrationNumber", { required: "Required" })} className="input-field" placeholder="Enter PAN number" />
										{errors.registrationNumber && <p className="text-red-500 text-xs mt-1 font-sans">{errors.registrationNumber.message}</p>}
									</div>
									<div>
										<label className="label">City *</label>
										<input {...register("city", { required: "Required" })} className="input-field" placeholder="Enter city" />
										{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
									</div>
								</div>
								<div>
									<label className="label">Address *</label>
									<input {...register("address", { required: "Required" })} className="input-field" placeholder="Enter address" />
									{errors.address && <p className="text-red-500 text-xs mt-1 font-sans">{errors.address.message}</p>}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="label">Contact Person</label>
										<input {...register("contactPerson")} className="input-field" placeholder="Enter contact person name" />
									</div>
									<div>
										<label className="label">Contact Phone</label>
										<input type="tel" {...register("contactPhone")} className="input-field" placeholder="Enter contact phone number" />
									</div>
								</div>
								<div>
									<label className="label">Website</label>
									<input {...register("website")} className="input-field" placeholder="Enter organization website" />
								</div>
								<div>
									<label className="label">Description</label>
									<textarea {...register("description")} rows={3} className="input-field resize-none" placeholder="Brief description of your organization..." />
								</div>
								<div>
									<label className="label">Legal Document (PDF/Image)</label>
									<div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${docFile ? "border-green-300 bg-green-50" : "border-stone-200 hover:border-crimson hover:bg-red-50"}`} onClick={() => document.getElementById("doc-upload").click()}>
										<input id="doc-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" hidden onChange={(e) => setDocFile(e.target.files[0])} />
										{docFile ? (
											<div className="flex items-center justify-center gap-2 text-green-600 font-sans text-sm">
												<CheckCircle className="w-5 h-5" />
												{docFile.name}
											</div>
										) : (
											<div>
												<Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
												<p className="text-sm text-stone-500 font-sans">Upload registration certificate or legal document</p>
												<p className="text-xs text-stone-400 font-sans mt-1">JPG, PNG up to 5MB</p>
											</div>
										)}
									</div>
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
