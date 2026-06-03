import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LocateFixed, Loader2, CheckCircle, MapPin } from "lucide-react";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";
import useGeolocation from "../../hooks/useGeolocation";

export default function DonorProfile() {
	const { user, profile, fetchMe } = useAuth();
	const [saving, setSaving] = useState(false);
	const [locationPinned, setLocationPinned] = useState(!!profile?.location?.coordinates?.length);

	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			city: user?.city || "",
			weight: profile?.weight || "",
			address: profile?.address || "",
			availability: profile?.availability ?? true,
		},
	});

	const handlePinLocation = () => {
		requestLocation();
	};

	React.useEffect(() => {
		if (coords && !locationPinned) {
			setValue("latitude", coords.latitude);
			setValue("longitude", coords.longitude);
			setLocationPinned(true);
			toast.success("Location updated! You'll now receive proximity-based alerts.");
		}
	}, [coords, locationPinned, setValue]);

	const onSubmit = async (data) => {
		setSaving(true);
		try {
			await axios.put("/api/donors/profile", data);
			await fetchMe();
			toast.success("Profile updated successfully!");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to update profile.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-display font-bold text-stone-800 mb-8">My Profile</h1>

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

			<div className="card p-6">
				<h3 className="font-display font-semibold text-stone-800 mb-5">Update Profile</h3>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="label">City</label>
							<input {...register("city", { maxLength: { value: 50, message: "City name too long" } })} className="input-field" placeholder="Your city" />
							{errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
						</div>
						<div>
							<label className="label">Weight (kg)</label>
							<input
								{...register("weight", {
									valueAsNumber: true,
									min: { value: 30, message: "Weight seems too low" },
									max: { value: 300, message: "Weight seems too high" },
								})}
								type="number"
								className="input-field"
								placeholder="e.g. 65"
							/>
							<p className="text-stone-400 text-xs mt-0.5 font-sans">Minimum 60 kg required</p>
							{errors.weight && <p className="text-red-500 text-xs mt-1 font-sans">{errors.weight.message}</p>}
						</div>
					</div>

					<div>
						<label className="label">Address</label>
						<input {...register("address", { maxLength: { value: 200, message: "Address too long" } })} className="input-field" placeholder="Your full address" />
						{errors.address && <p className="text-red-500 text-xs mt-1 font-sans">{errors.address.message}</p>}
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<p className="text-sm font-sans font-semibold text-stone-700 mb-1 flex items-center gap-2">
							<MapPin className="w-4 h-4 text-blue-500" />
							My Location
						</p>
						<p className="text-xs text-stone-500 font-sans mb-3">Keeping your location updated helps us alert you about emergencies and campaigns right in your area.</p>

						{locationPinned ? (
							<div className="flex items-center gap-2 text-green-700 text-sm font-sans">
								<CheckCircle className="w-4 h-4" />
								{coords ? `Location set (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})` : "Location already saved on your profile"}
								<button
									type="button"
									onClick={() => {
										setLocationPinned(false);
										setValue("latitude", "");
										setValue("longitude", "");
									}}
									className="ml-auto text-xs text-stone-400 hover:text-red-500"
								>
									Clear
								</button>
							</div>
						) : (
							<button type="button" onClick={handlePinLocation} disabled={geoLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-sans text-blue-700 hover:bg-blue-50 transition disabled:opacity-60">
								{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
								{geoLoading ? "Getting location…" : "Update My Location"}
							</button>
						)}

						{geoError && <p className="text-orange-600 text-xs mt-2 font-sans">{geoError}</p>}

						<input type="hidden" {...register("latitude")} />
						<input type="hidden" {...register("longitude")} />
					</div>

					<div className="flex items-center gap-3">
						<input {...register("availability")} type="checkbox" id="avail" className="w-4 h-4 text-crimson" />
						<label htmlFor="avail" className="text-sm text-stone-600 font-sans">
							I am currently available for donation
						</label>
					</div>

					<button type="submit" disabled={saving} className="btn-primary">
						{saving ? "Saving…" : "Save Changes"}
					</button>
				</form>
			</div>
		</div>
	);
}
