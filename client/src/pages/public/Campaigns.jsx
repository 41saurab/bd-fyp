import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { MapPin, Calendar, Users, Search, LocateFixed, Loader2 } from "lucide-react";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";
import { format } from "date-fns";
import useGeolocation from "../../hooks/useGeolocation";

const BLOOD_TYPES = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Campaigns() {
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({ status: "active", bloodType: "", city: "" });
	const [nearbyMode, setNearbyMode] = useState(false);
	const [radius, setRadius] = useState(25);
	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();

	const fetchCampaigns = useCallback(async () => {
		setLoading(true);
		try {
			let data,
				total = 0;
			if (nearbyMode && coords) {
				const params = new URLSearchParams({
					lat: coords.latitude,
					lng: coords.longitude,
					radius,
					status: filters.status || "active",
					...(filters.bloodType ? { bloodType: filters.bloodType } : {}),
				});
				const res = await axios.get(`/api/campaigns/nearby?${params}`);
				data = res.data.data || [];
				total = data.length;
			} else {
				const params = new URLSearchParams({ page, limit: 12, ...filters });
				const res = await axios.get(`/api/campaigns?${params}`);
				data = res.data.campaigns || res.data.data?.campaigns || [];
				total = res.data.total || 0;
			}
			setCampaigns(data);
			setTotal(total);
		} catch {
			setCampaigns([]);
		} finally {
			setLoading(false);
		}
	}, [nearbyMode, coords, filters, radius, page]);

	useEffect(() => {
		fetchCampaigns();
	}, [fetchCampaigns]);

	const handleNearbyToggle = () => {
		if (!nearbyMode && !coords) requestLocation();
		setNearbyMode((v) => !v);
		setPage(1);
	};

	const statusColor = {
		upcoming: "bg-blue-100 text-blue-700",
		active: "bg-green-100 text-green-700",
		completed: "bg-stone-100 text-stone-500",
		cancelled: "bg-red-100 text-red-600",
	};

	return (
		<div className="max-w-7xl mx-auto px-6 py-10">
			<div className="mb-8">
				<h1 className="text-4xl font-display font-bold text-stone-800 mb-2">Donation Campaigns</h1>
				<p className="text-stone-500 font-body">Find and register for blood donation drives near you</p>
			</div>

			<div className="card p-5 mb-8">
				<div className="flex flex-wrap gap-4 items-end">
					<div>
						<label className="label">Location</label>
						<button onClick={handleNearbyToggle} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold border-2 transition-all ${nearbyMode ? "bg-crimson border-crimson text-white" : "border-stone-300 text-stone-600 hover:border-crimson hover:text-crimson"}`}>
							{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
							Near Me
						</button>
					</div>

					{nearbyMode && (
						<div>
							<label className="label">Radius</label>
							<select className="input-field w-auto" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
								<option value={10}>10 km</option>
								<option value={25}>25 km</option>
								<option value={50}>50 km</option>
							</select>
						</div>
					)}

					{!nearbyMode && (
						<div className="flex-1 min-w-48">
							<label className="label">Search City</label>
							<div className="relative">
								<Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
								<input className="input-field pl-9" placeholder="Enter city..." value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} />
							</div>
						</div>
					)}

					<div>
						<label className="label">Status</label>
						<select className="input-field" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
							<option value="">All</option>
							<option value="upcoming">Upcoming</option>
							<option value="active">Active</option>
							<option value="completed">Completed</option>
						</select>
					</div>

					<div>
						<label className="label">Blood Type</label>
						<select className="input-field" value={filters.bloodType} onChange={(e) => setFilters((f) => ({ ...f, bloodType: e.target.value }))}>
							{BLOOD_TYPES.map((bt) => (
								<option key={bt} value={bt === "All" ? "" : bt}>
									{bt}
								</option>
							))}
						</select>
					</div>
				</div>

				{nearbyMode && geoError && <p className="text-orange-600 text-xs mt-3 font-sans">⚠️ {geoError} — showing city-filtered results instead.</p>}
			</div>

			<div className="flex items-center justify-between mb-4">
				<p className="text-sm text-stone-500 font-sans">
					{total} campaign{total !== 1 ? "s" : ""} found
					{nearbyMode && coords ? ` within ${radius} km` : ""}
				</p>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="card overflow-hidden animate-pulse">
							<div className="h-32 bg-stone-200" />
							<div className="p-5 space-y-3">
								<div className="h-4 bg-stone-200 rounded w-3/4" />
								<div className="h-3 bg-stone-100 rounded w-1/2" />
							</div>
						</div>
					))}
				</div>
			) : campaigns.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-stone-500 font-body text-lg">No campaigns found</p>
					{nearbyMode && (
						<button onClick={() => setRadius((r) => Math.min(r + 25, 100))} className="mt-3 text-crimson text-sm font-sans hover:underline">
							Expand search radius
						</button>
					)}
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{campaigns.map((c) => (
							<Link key={c._id} to={`/campaigns/${c._id}`} className="card overflow-hidden hover:shadow-blood transition-all duration-300 group">
								{c.image ? (
									<div className="h-40 overflow-hidden">
										<img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
									</div>
								) : (
									<div className="h-40 bg-gradient-to-br from-blood-800 to-crimson flex items-center justify-center">
										<span className="text-white text-4xl">🩸</span>
									</div>
								)}
								<div className="p-5">
									<div className="flex items-center justify-between mb-2">
										<span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
										<div className="flex gap-1">
											{c.targetBloodTypes?.slice(0, 3).map((bt) => (
												<BloodTypeBadge key={bt} type={bt} size="sm" />
											))}
										</div>
									</div>
									<h3 className="font-display font-semibold text-stone-800 mb-1 line-clamp-2">{c.title}</h3>
									<p className="text-xs text-stone-500 font-sans mb-3">{c.organization?.orgName}</p>
									<div className="space-y-1.5">
										<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
											<MapPin className="w-3.5 h-3.5 text-crimson" />
											{c.venue}, {c.city}
										</div>
										<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
											<Calendar className="w-3.5 h-3.5 text-crimson" />
											{format(new Date(c.startDate), "MMM d")} – {format(new Date(c.endDate), "MMM d, yyyy")}
										</div>
										<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
											<Users className="w-3.5 h-3.5 text-crimson" />
											{c.registeredDonors?.length || 0} registered
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>

					{!nearbyMode && Math.ceil(total / 12) > 1 && (
						<div className="flex justify-center gap-2 mt-10">
							{[...Array(Math.ceil(total / 12))].map((_, i) => (
								<button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-sans transition-colors ${page === i + 1 ? "bg-crimson text-white" : "border border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson"}`}>
									{i + 1}
								</button>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
