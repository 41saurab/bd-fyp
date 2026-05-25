import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";

export default function DonorProfile() {
	const { user, profile, fetchMe } = useAuth();
	const [saving, setSaving] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			city: user?.city || "",
			weight: profile?.weight || "",
			address: profile?.address || "",
			availability: profile?.availability ?? true,
		},
	});

	const onSubmit = async (data) => {
		setSaving(true);
		try {
			await axios.put("/api/donors/profile", data);
			await fetchMe();
			toast.success("Profile updated successfully!");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-display font-bold text-stone-800 mb-8">My Profile</h1>

			{/* Profile summary card */}
			<div className="card p-6 mb-6">
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 rounded-2xl bg-crimson/10 flex items-center justify-center">
						<span className="text-2xl">👤</span>
					</div>
					<div>
						<h2 className="font-display font-bold text-xl text-stone-800">{user?.name}</h2>
						<p className="text-stone-500 font-sans text-sm">{user?.email}</p>
						{profile?.bloodType && <BloodTypeBadge type={profile.bloodType} size="lg" />}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4 text-center py-4 border-y border-stone-100">
					<div>
						<p className="text-2xl font-display font-bold text-crimson">{profile?.totalDonations || 0}</p>
						<p className="text-xs text-stone-400 font-sans">Total Donations</p>
					</div>
					<div>
						<p className="text-2xl font-display font-bold text-green-600">{profile?.points || 0}</p>
						<p className="text-xs text-stone-400 font-sans">Points</p>
					</div>
				</div>
			</div>

			{/* Update form */}
			<div className="card p-6">
				<h3 className="font-display font-semibold text-stone-800 mb-5">Update Profile</h3>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">City</label>
							<input
								{...register("city", {
									maxLength: {
										value: 50,
										message: "City name must not exceed 50 characters",
									},
								})}
								className="input-field"
								placeholder="Your city"
							/>
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>
						<div>
							<label className="label">Weight (kg)</label>
							<input
								{...register("weight", {
									valueAsNumber: true,
									min: {
										value: 30,
										message: "Weight seems too low — please check",
									},
									max: {
										value: 300,
										message: "Weight seems too high — please check",
									},
								})}
								type="number"
								className="input-field"
								placeholder="e.g. 65"
							/>
							<p className="text-stone-400 text-xs mt-0.5 font-sans">Minimum 60 kg required to donate</p>
							{errors.weight && <p className="text-red-500 text-xs mt-1 font-sans">{errors.weight.message}</p>}
						</div>
					</div>
					<div>
						<label className="label">Address</label>
						<input
							{...register("address", {
								maxLength: {
									value: 200,
									message: "Address must not exceed 200 characters",
								},
							})}
							className="input-field"
							placeholder="Your full address"
						/>
						{errors.address && <p className="text-red-500 text-xs mt-1 font-sans">{errors.address.message}</p>}
					</div>
					<div className="flex items-center gap-3">
						<input {...register("availability")} type="checkbox" id="avail" className="w-4 h-4 text-crimson" />
						<label htmlFor="avail" className="text-sm text-stone-600 font-sans">
							I am currently available for donation
						</label>
					</div>
					<button type="submit" disabled={saving} className="btn-primary">
						{saving ? "Saving..." : "Save Changes"}
					</button>
				</form>
			</div>
		</div>
	);
}
