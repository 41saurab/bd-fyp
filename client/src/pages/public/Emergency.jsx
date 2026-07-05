import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Zap, MapPin, Phone, LocateFixed, Loader2, WifiOff } from "lucide-react";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";
import { formatDistanceToNow } from "date-fns";
import useGeolocation from "../../hooks/useGeolocation";

const BLOOD_TYPES = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_COLORS = {
	critical: "border-red-500 bg-red-50",
	urgent: "border-orange-400 bg-orange-50",
	moderate: "border-yellow-400 bg-yellow-50",
};

export default function Emergency() {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState({ bloodType: "", city: "" });
	const [nearbyMode, setNearbyMode] = useState(false);
	const [radius, setRadius] = useState(10);
	const { coords, loading: geoLoading, error: geoError, request: requestLocation } = useGeolocation();

	const fetchEmergencies = useCallback(async () => {
		setLoading(true);

		try {
			let res;

			if (nearbyMode && coords?.latitude && coords?.longitude) {
				const params = new URLSearchParams({
					lat: coords.latitude,
					lng: coords.longitude,
					radius: radius.toString(),
					...(filter.bloodType ? { bloodType: filter.bloodType } : {}),
				});

				res = await axios.get(`/api/emergency/nearby?${params}`);
			} else {
				const params = new URLSearchParams({
					status: "active",
					...(filter.bloodType ? { bloodType: filter.bloodType } : {}),
					...(filter.city ? { city: filter.city } : {}),
				});

				res = await axios.get(`/api/emergency?${params}`);
			}

			setRequests(res.data.data || res.data || []);
		} catch {
			setRequests([]);
		} finally {
			setLoading(false);
		}
	}, [nearbyMode, coords, filter, radius]);

	useEffect(() => {
		fetchEmergencies();
	}, [fetchEmergencies]);
	console.log(requests.length);
	const handleNearbyToggle = () => {
		const turningOn = !nearbyMode;
		setNearbyMode(turningOn);

		if (turningOn && !coords) {
			requestLocation();
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-6 py-10">
			<div className="bg-gradient-to-r from-blood-900 to-crimson rounded-2xl p-8 mb-8 text-white">
				<div className="flex items-center gap-3 mb-3">
					<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center emergency-pulse">
						<Zap className="w-5 h-5" />
					</div>
					<h1 className="text-3xl font-display font-bold">Emergency Blood Requests</h1>
				</div>
				<p className="font-body text-red-100 max-w-2xl">Patients need blood urgently. If your blood type matches, please respond immediately.</p>
			</div>

			<div className="flex flex-wrap gap-4 mb-8 items-end">
				<button onClick={handleNearbyToggle} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold border-2 transition-all ${nearbyMode ? "bg-crimson border-crimson text-white shadow-blood" : "border-stone-300 text-stone-600 hover:border-crimson hover:text-crimson"}`}>
					{geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
					Near Me
				</button>

				{nearbyMode && (
					<div className="flex items-center gap-2">
						<label className="text-sm text-stone-500 font-sans">within</label>
						<select className="input-field w-auto py-2" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
							<option value={5}>5 km</option>
							<option value={10}>10 km</option>
							<option value={20}>20 km</option>
							<option value={50}>50 km</option>
						</select>
					</div>
				)}

				<select className="input-field w-auto" value={filter.bloodType} onChange={(e) => setFilter((f) => ({ ...f, bloodType: e.target.value }))}>
					{BLOOD_TYPES.map((bt) => (
						<option key={bt} value={bt === "All" ? "" : bt}>
							{bt === "All" ? "All Blood Types" : bt}
						</option>
					))}
				</select>

				{!nearbyMode && <input className="input-field w-48" placeholder="Filter by city..." value={filter.city} onChange={(e) => setFilter((f) => ({ ...f, city: e.target.value }))} />}

				<div className="ml-auto text-sm text-stone-500 font-sans self-center">
					{requests.length} active request{requests.length !== 1 ? "s" : ""}
					{nearbyMode && coords && ` within ${radius} km`}
				</div>
			</div>

			{nearbyMode && geoError && (
				<div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-orange-700 font-sans">
					<WifiOff className="w-4 h-4 flex-shrink-0" />
					<span>Could not get your location: {geoError}. Showing all results instead.</span>
				</div>
			)}

			<>
				{geoLoading && nearbyMode ? (
					<div className="flex items-center justify-center gap-3 py-16 text-stone-400 font-sans">
						<Loader2 className="w-5 h-5 animate-spin" />
						Getting your location…
					</div>
				) : loading ? (
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="card p-6 animate-pulse h-32" />
						))}
					</div>
				) : requests.length === 0 ? (
					<div className="text-center py-20">
						<div className="text-5xl mb-4">✅</div>
						<p className="text-stone-500 font-body text-lg">{nearbyMode ? `No active emergencies within ${radius} km of your location` : "No active emergency requests right now"}</p>
						{nearbyMode && (
							<button onClick={() => setRadius((r) => Math.min(r * 2, 100))} className="mt-4 text-crimson text-sm font-sans hover:underline">
								Expand search radius
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{requests.map((req) => (
							<Link key={req._id} to={`/emergency/${req._id}`} className={`block card border-l-4 p-6 hover:shadow-blood transition-all duration-300 ${URGENCY_COLORS[req.urgencyLevel] || URGENCY_COLORS.urgent}`}>
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-start gap-4">
										<div className="w-16 h-16 rounded-2xl bg-crimson flex items-center justify-center flex-shrink-0 emergency-pulse">
											<span className="text-white font-bold font-sans text-lg">{req.bloodType}</span>
										</div>
										<div>
											<div className="flex items-center gap-2 mb-1">
												<span className={`text-xs font-sans font-bold uppercase px-2 py-0.5 rounded-full ${req.urgencyLevel === "critical" ? "bg-red-600 text-white" : "bg-orange-500 text-white"}`}>{req.urgencyLevel}</span>
												<span className="text-xs text-stone-400 font-sans">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
											</div>
											<h3 className="font-display font-semibold text-stone-800">{req.organization?.orgName || "Hospital"}</h3>
											<p className="text-sm text-stone-500 font-sans">{req.reason}</p>
											<div className="flex flex-wrap gap-4 mt-2">
												<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
													<MapPin className="w-3.5 h-3.5 text-crimson" />
													{req.location}, {req.city}
												</div>
												<div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
													<Phone className="w-3.5 h-3.5 text-crimson" />
													{req.contactPhone}
												</div>
											</div>
										</div>
									</div>
									<div className="text-right flex-shrink-0">
										<p className="text-2xl font-display font-bold text-crimson">{req.unitsNeeded}</p>
										<p className="text-xs text-stone-400 font-sans">units needed</p>
										<p className="text-xs text-green-600 font-sans mt-1">{req.respondents?.length || 0} responding</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</>
		</div>
	);
}
