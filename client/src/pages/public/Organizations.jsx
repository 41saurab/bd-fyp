// Organizations.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { MapPin, Building2, Star } from "lucide-react";

export function Organizations() {
	const [orgs, setOrgs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState({ city: "", orgType: "" });

	useEffect(() => {
		const params = new URLSearchParams(filter);
		axios
			.get(`/api/organizations?${params}`)
			.then((r) => setOrgs(r.data || []))
			.finally(() => setLoading(false));
	}, [filter]);

	const typeColor = { hospital: "bg-blue-100 text-blue-700", blood_bank: "bg-red-100 text-red-700", clinic: "bg-green-100 text-green-700", ngo: "bg-purple-100 text-purple-700", other: "bg-stone-100 text-stone-600" };

	return (
		<div className="max-w-7xl mx-auto px-6 py-10">
			<h1 className="text-4xl font-display font-bold text-stone-800 mb-2">Partner Organizations</h1>
			<p className="text-stone-500 font-body mb-8">Verified hospitals and blood banks in our network</p>
			<div className="flex gap-4 mb-8">
				<input className="input-field w-48" placeholder="City..." value={filter.city} onChange={(e) => setFilter((f) => ({ ...f, city: e.target.value }))} />
				<select className="input-field w-auto" value={filter.orgType} onChange={(e) => setFilter((f) => ({ ...f, orgType: e.target.value }))}>
					<option value="">All Types</option>
					<option value="hospital">Hospital</option>
					<option value="blood_bank">Blood Bank</option>
					<option value="clinic">Clinic</option>
					<option value="ngo">NGO</option>
				</select>
			</div>
			{loading ? (
				<div className="grid grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="card p-6 animate-pulse h-32"></div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{orgs.map((org) => (
						<Link key={org._id} to={`/organizations`} className="card p-6 hover:shadow-blood transition-all duration-300">
							<div className="flex items-start gap-3 mb-3">
								<div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
									<Building2 className="w-6 h-6 text-crimson" />
								</div>
								<div>
									<h3 className="font-display font-semibold text-stone-800">{org.orgName}</h3>
									<span className={`text-xs px-2 py-0.5 rounded-full font-sans ${typeColor[org.orgType] || typeColor.other}`}>{org.orgType?.replace("_", " ")}</span>
								</div>
							</div>
							<div className="space-y-1.5">
								<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
									<MapPin className="w-3.5 h-3.5 text-crimson" />
									{org.city}
								</div>
								<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
									<Star className="w-3.5 h-3.5 text-yellow-500" />
									{org.totalCampaigns} campaigns
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

export default Organizations;
