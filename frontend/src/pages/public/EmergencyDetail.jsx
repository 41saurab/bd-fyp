import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Phone, User, Clock, Zap, Droplet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";

export default function EmergencyDetail() {
	const { id } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [req, setReq] = useState(null);
	const [loading, setLoading] = useState(true);
	const [responding, setResponding] = useState(false);

	useEffect(() => {
		axios
			.get(`/api/emergency/${id}`)
			.then((r) => setReq(r.data))
			.catch(() => navigate("/emergency"))
			.finally(() => setLoading(false));
	}, [id]);

	const handleRespond = async () => {
		if (!user) return navigate("/login");
		if (user.role !== "donor") return toast.error("Only donors can respond");
		setResponding(true);
		try {
			await axios.post(`/api/emergency/${id}/respond`);
			toast.success("Response recorded! The hospital will contact you.");
			setReq((r) => ({ ...r, hasResponded: true, respondentCount: (r.respondentCount || 0) + 1 }));
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to respond");
		} finally {
			setResponding(false);
		}
	};

	const hasResponded = req?.hasResponded ?? false;
	const respondentCount = req?.respondentCount ?? req?.respondents?.length ?? 0;

	const canSeeRespondents = Array.isArray(req?.respondents);
	const urgencyColors = { critical: "from-red-900 to-red-700", urgent: "from-blood-800 to-crimson", moderate: "from-orange-700 to-orange-500" };

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div>
			</div>
		);
	if (!req) return null;

	return (
		<div className="max-w-4xl mx-auto px-6 py-10">
			<div className={`bg-gradient-to-r ${urgencyColors[req.urgencyLevel] || urgencyColors.urgent} rounded-2xl p-8 mb-8 text-white`}>
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center emergency-pulse">
						<Zap className="w-5 h-5" />
					</div>
					<span className="font-sans font-bold text-sm uppercase tracking-wide">{req.urgencyLevel} Emergency</span>
				</div>
				<div className="flex items-end gap-6">
					<div>
						<p className="text-6xl font-display font-bold">{req.bloodType}</p>
						<p className="font-body text-red-100">Blood Type Needed</p>
					</div>
					<div>
						<p className="text-3xl font-display font-bold">{req.unitsNeeded - req.unitsReceived}</p>
						<p className="font-body text-red-100">Units Still Needed</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-5">
					<div className="card p-6">
						<h2 className="font-display font-bold text-xl text-stone-800 mb-4">Request Details</h2>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-stone-400 font-sans uppercase tracking-wide">Hospital / Organization</p>
								<p className="font-sans font-medium text-stone-700 mt-0.5">{req.organization?.orgName}</p>
							</div>

							<div>
								<p className="text-xs text-stone-400 font-sans uppercase tracking-wide">Location</p>
								<p className="font-sans font-medium text-stone-700 mt-0.5">{req.organization?.city}</p>
							</div>
							<div>
								<p className="text-xs text-stone-400 font-sans uppercase tracking-wide">Patient Name</p>
								<p className="font-sans font-medium text-stone-700 mt-0.5">{req.patientName}</p>
							</div>
							<div>
								<p className="text-xs text-stone-400 font-sans uppercase tracking-wide">Reason</p>
								<p className="font-sans text-stone-600 mt-0.5">{req.reason}</p>
							</div>
							{req.additionalNotes && (
								<div>
									<p className="text-xs text-stone-400 font-sans uppercase tracking-wide">Additional Notes</p>
									<p className="font-sans text-stone-600 mt-0.5">{req.additionalNotes}</p>
								</div>
							)}
							<div className="flex items-center gap-2 text-stone-500">
								<Clock className="w-4 h-4 text-crimson" />
								<span className="text-sm font-sans">Posted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{/* Contact & CTA */}
					<div className="card p-6">
						<h3 className="font-display font-semibold text-stone-800 mb-4">Contact Information</h3>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<User className="w-4 h-4 text-crimson" />
								<span className="text-sm font-sans text-stone-600">{req.contactPerson}</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-crimson" />
								<a href={`tel:${req.contactPhone}`} className="text-sm font-sans text-crimson font-medium hover:underline">
									{req.contactPhone}
								</a>
							</div>
							<div className="flex items-start gap-2">
								<MapPin className="w-4 h-4 text-crimson mt-0.5" />
								<span className="text-sm font-sans text-stone-600">
									{req.location}, {req.city}
								</span>
							</div>
						</div>
					</div>

					<div className="card p-6">
						<div className="flex items-center gap-2 mb-3 text-amber-600">
							<Zap className="w-4 h-4" />
							<p className="font-sans font-semibold text-stone-700">+{req.pointsReward || 15} Points when you donate</p>
						</div>
						<p className="text-sm font-sans text-stone-500 mb-3">
							{respondentCount} donor{respondentCount === 1 ? "" : "s"} {respondentCount === 1 ? "has" : "have"} responded
						</p>
						{/* Donate button — donors only. Orgs/admins see the roster below
						    instead; guests get a login prompt. The role check used to
						    live only inside handleRespond(), so the button itself was
						    visible (and clickable, just erroring) for every role. */}
						{req.status === "active" &&
							(!user || user.role === "donor") &&
							(hasResponded ? (
								<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
									<p className="text-green-700 font-sans font-semibold text-sm">✓ You've Responded!</p>
									<p className="text-green-600 text-xs mt-1 font-sans">The hospital will contact you</p>
								</div>
							) : (
								<button onClick={handleRespond} disabled={responding} className="w-full py-3 bg-crimson hover:bg-blood-800 text-white font-sans font-semibold rounded-xl transition-colors emergency-pulse">
									{responding ? "Sending..." : "🩸 I Can Donate"}
								</button>
							))}
						{req.status !== "active" && (
							<div className="bg-stone-100 rounded-xl p-3 text-center">
								<p className="text-stone-500 text-sm font-sans capitalize">{req.status}</p>
							</div>
						)}
					</div>

					{/* Donor roster — only rendered when the backend actually sent
					    respondent identities, which it only does for the owning
					    org or an admin. Everyone else just sees the count above. */}
					{canSeeRespondents && (
						<div className="card p-6">
							<h3 className="font-display font-semibold text-stone-800 mb-4 flex items-center gap-2">
								<User className="w-4 h-4 text-crimson" /> Responded Donors ({req.respondents.length})
							</h3>
							{req.respondents.length === 0 ? (
								<p className="text-stone-400 font-sans text-sm text-center py-4">No donors have responded yet.</p>
							) : (
								<div className="space-y-3">
									{req.respondents.map((r) => {
										const donor = r.donor;
										if (!donor || typeof donor !== "object") return null;
										return (
											<div key={donor._id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100">
												<div className="w-9 h-9 rounded-full bg-crimson/10 flex items-center justify-center flex-shrink-0">
													<Droplet className="w-4 h-4 text-crimson" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-sans font-semibold text-stone-800 text-sm truncate">{donor.user?.name || "Unknown donor"}</p>
													{donor.user?.phone && (
														<a href={`tel:${donor.user.phone}`} className="text-xs text-crimson font-sans hover:underline">
															{donor.user.phone}
														</a>
													)}
												</div>
												<BloodTypeBadge type={donor.bloodType} />
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
