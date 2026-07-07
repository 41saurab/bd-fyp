import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Zap, Plus, Clock, CheckCircle, AlertTriangle, TrendingUp, Droplets } from "lucide-react";

export default function OrgDashboard() {
	const { user, profile } = useAuth();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		axios
			.get("/api/organizations/dashboard")
			.then((r) => setData(r.data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div>
			</div>
		);

	const org = data?.org;
	const isPending = org?.status === "pending";
	const isRejected = org?.status === "rejected";

	if (isPending)
		return (
			<div className="max-w-2xl mx-auto px-6 py-20 text-center">
				<div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<Clock className="w-10 h-10 text-yellow-500" />
				</div>
				<h1 className="text-2xl font-display font-bold text-stone-800 mb-3">Awaiting Approval</h1>
				<p className="text-stone-500 font-body">
					Your organization <strong>{org?.orgName}</strong> is under review. Our admin team will verify your documents within 24-48 hours.
				</p>
			</div>
		);

	if (isRejected)
		return (
			<div className="max-w-2xl mx-auto px-6 py-20 text-center">
				<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<AlertTriangle className="w-10 h-10 text-red-500" />
				</div>
				<h1 className="text-2xl font-display font-bold text-stone-800 mb-3">Registration Not Approved</h1>
				<p className="text-stone-500 font-body mb-3">Unfortunately, your organization was not approved.</p>
				{org?.rejectionReason && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-sans">{org.rejectionReason}</div>}
			</div>
		);

	return (
		<div className="max-w-7xl mx-auto px-6 py-8">
			<div className="bg-gradient-to-r from-blood-800 to-crimson rounded-2xl p-7 mb-8 text-white">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-red-200 text-sm font-sans mb-1">Organization Dashboard</p>
						<h1 className="text-3xl font-display font-bold">{org?.orgName}</h1>
						<div className="flex items-center gap-3 mt-2">
							<span className="bg-white/20 text-white text-xs font-sans px-3 py-1 rounded-full capitalize">{org?.orgType?.replace("_", " ")}</span>
							<span className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-sans px-3 py-1 rounded-full flex items-center gap-1">
								<CheckCircle className="w-3 h-3" /> Approved
							</span>
						</div>
					</div>
					<div className="hidden md:flex gap-3">
						<Link to="/organization/campaigns/create" className="bg-white text-crimson font-sans font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center gap-2">
							<Plus className="w-4 h-4" /> New Campaign
						</Link>
						<Link to="/organization/emergency/create" className="bg-red-900/50 border border-white/30 text-white font-sans font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-900/70 transition-colors flex items-center gap-2">
							<Zap className="w-4 h-4" /> Emergency Request
						</Link>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				{[
					{ icon: Calendar, label: "Active Campaigns", value: data?.activeCampaigns || 0, color: "text-blue-600" },
					{ icon: TrendingUp, label: "Total Campaigns", value: data?.totalCampaigns || 0, color: "text-green-600" },
					{ icon: Zap, label: "Active Emergencies", value: data?.activeEmergencies || 0, color: "text-red-600" },
					{ icon: Droplets, label: "Total Donations", value: org?.totalDonationsReceived || 0, color: "text-crimson" },
				].map((s) => (
					<div key={s.label} className="card p-5">
						<s.icon className={`w-6 h-6 ${s.color} mb-3`} />
						<p className="text-2xl font-display font-bold text-stone-800">{s.value}</p>
						<p className="text-xs text-stone-400 font-sans mt-0.5">{s.label}</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="card p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-display font-semibold text-stone-800">Recent Campaigns</h3>
						<Link to="/organization/campaigns" className="text-xs text-crimson font-sans hover:underline">
							View all
						</Link>
					</div>
					{!data?.recentCampaigns?.length ? (
						<div className="text-center py-8">
							<p className="text-stone-400 font-sans text-sm mb-3">No campaigns yet</p>
							<Link to="/organization/campaigns/create" className="btn-primary text-sm">
								Create First Campaign
							</Link>
						</div>
					) : (
						<div className="space-y-3">
							{data.recentCampaigns.map((c) => (
								<div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
									<div className="w-10 h-10 bg-crimson/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<img src={c.image} alt="" className=" object-cover rounded-full" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-sans font-medium text-stone-700 truncate">{c.title}</p>
										<p className="text-xs text-stone-400 font-sans">
											{c.city} · {c.status}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold font-sans text-crimson">
											{c.registeredDonors?.length || 0}/{c.targetUnits}
										</p>
										<p className="text-xs text-stone-400 font-sans">registered</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="card p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-display font-semibold text-stone-800">Emergency Requests</h3>
						<Link to="/organization/emergency" className="text-xs text-crimson font-sans hover:underline">
							View all
						</Link>
					</div>
					{!data?.recentEmergencies?.length ? (
						<div className="text-center py-8">
							<p className="text-stone-400 font-sans text-sm mb-3">No emergency requests</p>
							<Link to="/organization/emergency/create" className="btn-primary text-sm">
								Post Emergency
							</Link>
						</div>
					) : (
						<div className="space-y-3">
							{data.recentEmergencies.map((e) => (
								<div key={e._id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
									<div className="w-10 h-10 bg-crimson rounded-xl flex items-center justify-center flex-shrink-0">
										<span className="text-white text-xs font-bold font-sans">{e.bloodType}</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-sans font-medium text-stone-700 truncate">{e.patientName}</p>
										<p className="text-xs text-stone-400 font-sans capitalize">
											{e.urgencyLevel} · {e.status}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold font-sans text-crimson">{e.respondents?.length || 0}</p>
										<p className="text-xs text-stone-400 font-sans">responding</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="card p-6 mt-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-display font-semibold text-stone-800">Blood Inventory</h3>
					<Link to="/organization/inventory" className="btn-outline text-sm">
						Update
					</Link>
				</div>
				<div className="grid grid-cols-4 md:grid-cols-8 gap-3">
					{Object.entries(org?.bloodInventory || {}).map(([type, units]) => (
						<div key={type} className={`text-center p-3 rounded-xl border ${units === 0 ? "bg-red-50 border-red-200" : units < 5 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
							<p className="font-bold font-sans text-stone-800 text-sm">{type}</p>
							<p className={`text-lg font-display font-bold ${units === 0 ? "text-red-600" : units < 5 ? "text-yellow-600" : "text-green-600"}`}>{units}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
