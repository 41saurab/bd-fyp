import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, MapPin, Users, Droplet, CheckCircle2, Clock, Pencil, Ban, Trash2 } from "lucide-react";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const statusColor = {
	upcoming: "bg-blue-100 text-blue-700",
	active: "bg-green-100 text-green-700",
	completed: "bg-stone-100 text-stone-500",
	cancelled: "bg-red-100 text-red-600",
};

const donorStatusStyle = {
	registered: "bg-amber-50 text-amber-700 border-amber-200",
	donated: "bg-green-50 text-green-700 border-green-200",
	cancelled: "bg-stone-50 text-stone-500 border-stone-200",
	no_show: "bg-red-50 text-red-600 border-red-200",
};

export default function OrgCampaignDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [campaign, setCampaign] = useState(null);
	const [loading, setLoading] = useState(true);
	const [markingId, setMarkingId] = useState(null);
	const [actionLoading, setActionLoading] = useState(false);

	const load = () => {
		axios
			.get(`/api/campaigns/${id}`)
			.then((r) => setCampaign(r.data))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, [id]);

	const handleMarkDonated = async (donorId) => {
		setMarkingId(donorId);
		try {
			const res = await axios.patch(`/api/campaigns/${id}/donors/${donorId}/donate`);
			if (res.data?.newBadge) {
				toast.success(`Donation recorded! Donor earned the "${res.data.newBadge}" badge 🏆`);
			} else {
				toast.success("Donation recorded — points and inventory updated.");
			}
			load();
		} catch (err) {
			toast.error(err.response?.data?.message || "Could not record this donation.");
		} finally {
			setMarkingId(null);
		}
	};

	const handleCancel = async () => {
		setActionLoading(true);
		try {
			await axios.patch(`/api/campaigns/${id}/cancel`);
			toast.success("Campaign cancelled.");
			load();
		} catch (err) {
			toast.error(err.response?.data?.message || "Could not cancel this campaign.");
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async () => {
		setActionLoading(true);
		try {
			await axios.delete(`/api/campaigns/${id}`);
			toast.success("Campaign deleted.");
			navigate("/organization/campaigns");
		} catch (err) {
			toast.error(err.response?.data?.message || "Could not delete this campaign.");
			setActionLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div>
			</div>
		);
	}
	if (!campaign) {
		return (
			<div className="max-w-3xl mx-auto px-6 py-16 text-center">
				<p className="text-stone-500 font-body">Campaign not found.</p>
				<Link to="/organization/campaigns" className="text-crimson font-sans font-medium mt-2 inline-block">
					Back to campaigns
				</Link>
			</div>
		);
	}

	const registeredDonors = campaign.registeredDonors || [];
	const progress = campaign.targetUnits ? Math.min(100, (campaign.collectedUnits / campaign.targetUnits) * 100) : 0;

	return (
		<div className="max-w-4xl mx-auto px-6 py-8">
			<div className="flex items-center justify-between mb-6">
				<Link to="/organization/campaigns" className="flex items-center gap-1.5 text-sm font-sans text-stone-500 hover:text-crimson">
					<ArrowLeft className="w-4 h-4" /> Back to My Campaigns
				</Link>
				{campaign.status !== "completed" && campaign.status !== "cancelled" && (
					<div className="flex items-center gap-2">
						<Button asChild variant="outline" size="sm">
							<Link to={`/organization/campaigns/${id}/edit`}>
								<Pencil className="w-3.5 h-3.5" /> Edit
							</Link>
						</Button>
						<ConfirmDialog
							trigger={
								<Button variant="amber" size="sm" disabled={actionLoading}>
									<Ban className="w-3.5 h-3.5" /> Cancel
								</Button>
							}
							title="Cancel this campaign?"
							description="Registered donors will be notified that it's been cancelled."
							confirmLabel="Cancel Campaign"
							variant="destructive"
							loading={actionLoading}
							onConfirm={handleCancel}
						/>
						{registeredDonors.length === 0 && (
							<ConfirmDialog
								trigger={
									<Button variant="destructive" size="sm" disabled={actionLoading}>
										<Trash2 className="w-3.5 h-3.5" /> Delete
									</Button>
								}
								title="Permanently delete this campaign?"
								description="This can't be undone."
								confirmLabel="Delete"
								variant="destructive"
								loading={actionLoading}
								onConfirm={handleDelete}
							/>
						)}
					</div>
				)}
			</div>

			<div className="card p-6 mb-6">
				<div className="flex items-start justify-between gap-4 mb-4">
					<div>
						<h1 className="text-2xl font-display font-bold text-stone-800">{campaign.title}</h1>
						<div className="flex flex-wrap gap-3 text-sm text-stone-400 font-sans mt-2">
							<span className="flex items-center gap-1">
								<MapPin className="w-3.5 h-3.5" /> {campaign.venue}, {campaign.city}
							</span>
							<span className="flex items-center gap-1">
								<Calendar className="w-3.5 h-3.5" /> {format(new Date(campaign.startDate), "MMM d, yyyy")} – {format(new Date(campaign.endDate), "MMM d, yyyy")}
							</span>
						</div>
					</div>
					<span className={`text-xs px-3 py-1 rounded-full font-sans font-medium flex-shrink-0 ${statusColor[campaign.status] || statusColor.active}`}>{campaign.status}</span>
				</div>

				<div className="flex flex-wrap gap-1.5 mb-4">
					{campaign.targetBloodTypes?.map((bt) => (
						<BloodTypeBadge key={bt} type={bt} />
					))}
				</div>

				<div className="flex justify-between mb-2">
					<span className="text-sm font-sans text-stone-500">{campaign.collectedUnits} units collected</span>
					<span className="text-sm font-sans text-stone-500">{campaign.targetUnits} target</span>
				</div>
				<div className="h-3 bg-stone-100 rounded-full overflow-hidden">
					<div className="h-full bg-gradient-to-r from-crimson to-blood-400 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
				</div>
			</div>

			<div className="card p-6">
				<h2 className="font-display font-semibold text-stone-800 mb-4 flex items-center gap-2">
					<Users className="w-5 h-5 text-crimson" /> Registered Donors ({registeredDonors.length})
				</h2>

				{registeredDonors.length === 0 ? (
					<p className="text-stone-400 font-sans text-sm py-8 text-center">No donors have registered yet.</p>
				) : (
					<div className="space-y-3">
						{registeredDonors.map((reg) => {
							const donor = reg.donor;
							if (!donor || typeof donor !== "object") return null;
							const isDonated = reg.status === "donated";
							return (
								<div key={donor._id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-100">
									<div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center flex-shrink-0">
										<Droplet className="w-5 h-5 text-crimson" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-sans font-semibold text-stone-800 truncate">{donor.user?.name || "Unknown donor"}</p>
										<p className="text-xs text-stone-400 font-sans">{donor.user?.phone || donor.user?.email}</p>
									</div>
									<BloodTypeBadge type={donor.bloodType} />
									<span className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium border flex-shrink-0 ${donorStatusStyle[reg.status] || donorStatusStyle.registered} flex items-center gap-1`}>
										{isDonated ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
										{reg.status.replace("_", " ")}
									</span>
									{!isDonated && reg.status === "registered" && (
										<Button size="sm" onClick={() => handleMarkDonated(donor._id)} disabled={markingId === donor._id} className="whitespace-nowrap">
											{markingId === donor._id ? "Recording..." : "Mark as Donated"}
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
