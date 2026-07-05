import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Heart, Zap, Award, Users, Calendar, Shield, ArrowRight, Droplets, MapPin } from "lucide-react";

const BloodDrop = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
		<path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
	</svg>
);

const stats_data = [
	{ label: "Lives Saved Daily", value: "4.5M", icon: Heart },
	{ label: "Active Donors", value: "2.3M", icon: Users },
	{ label: "Partner Hospitals", value: "8,400", icon: Shield },
	{ label: "Campaigns Monthly", value: "12K+", icon: Calendar },
];

const features = [
	{ icon: Zap, title: "Emergency Alerts", desc: "Instant SMS and email alerts matching your blood type when emergencies arise." },
	{ icon: Award, title: "Points & Badges", desc: "Earn rewards for every donation. Climb the leaderboard, unlock achievements." },
	{ icon: Calendar, title: "Campaign Management", desc: "Organizations can create and manage donation drives effortlessly." },
	{ icon: Shield, title: "Verified Organizations", desc: "All hospitals and blood banks are verified by our admin team." },
	{ icon: MapPin, title: "Location-Based", desc: "Find donation campaigns and emergencies in your city automatically." },
	{ icon: Users, title: "Donor Community", desc: "Join thousands of heroes making a difference every single day." },
];

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Landing() {
	const [campaigns, setCampaigns] = useState([]);
	const [emergencies, setEmergencies] = useState([]);

	useEffect(() => {
		axios
			.get("/api/campaigns?status=active&limit=3")
			.then((r) => setCampaigns(r.data.campaigns || []))
			.catch(() => {});
		axios
			.get("/api/emergency?status=active")
			.then((r) => setEmergencies((r.data || []).slice(0, 3)))
			.catch(() => {});
	}, []);

	return (
		<div className="overflow-hidden">
			<section className="relative min-h-[92vh] flex items-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-red-50/30 to-stone-50">
					{[...Array(8)].map((_, i) => (
						<BloodDrop
							key={i}
							className={`absolute fill-crimson/10 animate-float`}
							style={{
								width: `${20 + i * 15}px`,
								left: `${10 + i * 12}%`,
								top: `${15 + (i % 3) * 20}%`,
								animationDelay: `${i * 0.4}s`,
								animationDuration: `${3 + i * 0.5}s`,
							}}
						/>
					))}
				</div>

				<div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
					<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
						<div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
							<span className="w-2 h-2 rounded-full bg-crimson animate-pulse"></span>
							<span className="text-sm text-crimson font-sans font-medium">Be a hero today</span>
						</div>
						<h1 className="text-5xl lg:text-6xl font-display font-bold text-stone-900 leading-tight mb-6">
							One Donation.
							<br />
							<span className="text-crimson italic">Three Lives</span> Saved.
						</h1>
						<p className="text-lg text-stone-500 font-body leading-relaxed mb-8 max-w-xl">Raktabindu connects generous donors with hospitals and blood banks. Register, get matched for campaigns, respond to emergencies, and earn recognition for your life-saving contributions.</p>
						<div className="flex flex-wrap gap-4">
							<Link to="/register/donor" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
								<Droplets className="w-5 h-5" />
								Become a Donor
							</Link>
							<Link to="/emergency" className="btn-outline flex items-center gap-2 text-base px-8 py-3">
								<Zap className="w-5 h-5" />
								View Emergencies
							</Link>
						</div>
						<div className="flex items-center gap-6 mt-10">
							<div className="flex -space-x-3">
								{["#c0392b", "#e74c3c", "#922b21", "#d35400", "#884ea0"].map((c, i) => (
									<div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-sans font-bold" style={{ background: c }}>
										{["A+", "O-", "B+", "AB+", "O+"][i]}
									</div>
								))}
							</div>
							<p className="text-sm text-stone-500 font-sans">
								Join <strong className="text-stone-700">50,000+</strong> registered donors
							</p>
						</div>
					</motion.div>

					<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:flex items-center justify-center">
						<div className="relative w-96 h-96">
							<div className="absolute inset-0 flex items-center justify-center">
								<BloodDrop className="w-48 h-48 fill-crimson/20 animate-float" />
							</div>
							<div className="absolute inset-8 flex items-center justify-center">
								<BloodDrop className="w-40 h-40 fill-crimson/40 animate-float" style={{ animationDelay: "0.5s" }} />
							</div>
							<div className="absolute inset-16 flex items-center justify-center">
								<BloodDrop className="w-28 h-28 fill-crimson animate-heartbeat" />
							</div>
							{bloodTypes.map((bt, i) => {
								const angle = (i / 8) * 2 * Math.PI;
								const x = 50 + 42 * Math.cos(angle);
								const y = 50 + 42 * Math.sin(angle);
								return (
									<div key={bt} className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-blood flex items-center justify-center text-xs font-bold text-crimson font-sans border border-red-100" style={{ left: `${x}%`, top: `${y}%` }}>
										{bt}
									</div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</section>

			<section className="bg-crimson py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{stats_data.map((stat, i) => (
							<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center text-white">
								<stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
								<p className="text-3xl font-display font-bold">{stat.value}</p>
								<p className="text-sm font-sans text-red-100">{stat.label}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{emergencies.length > 0 && (
				<section className="bg-stone-900 py-8 border-y border-stone-800">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex items-center gap-4 mb-4">
							<div className="flex items-center gap-2 bg-red-900/50 px-3 py-1.5 rounded-full">
								<span className="w-2 h-2 bg-red-400 rounded-full animate-pulse emergency-pulse"></span>
								<span className="text-red-400 text-sm font-sans font-semibold uppercase tracking-wide">LIVE EMERGENCIES</span>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{emergencies.map((em) => (
								<Link key={em._id} to={`/emergency/${em._id}`} className="flex items-center gap-3 bg-stone-800 rounded-xl p-4 hover:bg-stone-700 transition-colors group">
									<div className="w-12 h-12 rounded-full bg-crimson/20 border border-crimson/30 flex items-center justify-center flex-shrink-0">
										<span className="text-blood-400 font-bold font-sans text-sm">{em.bloodType}</span>
									</div>
									<div className="min-w-0">
										<p className="text-white text-sm font-sans font-medium truncate">{em.organization?.orgName || "Hospital"}</p>
										<p className="text-stone-400 text-xs font-sans">
											{em.city} · {em.unitsNeeded} units needed
										</p>
									</div>
									<ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-blood-400 transition-colors ml-auto flex-shrink-0" />
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			<section className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center mb-16">
						<motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="section-title mb-4">
							Everything You Need to
							<br />
							<span className="text-crimson italic">Save Lives</span>
						</motion.h2>
						<p className="text-stone-500 font-body max-w-2xl mx-auto text-lg">A complete platform connecting donors, hospitals, and blood banks — with smart matching, emergency alerts, and gamification.</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((f, i) => (
							<motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-6 hover:shadow-blood transition-all duration-300 group">
								<div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-crimson transition-colors">
									<f.icon className="w-6 h-6 text-crimson group-hover:text-white transition-colors" />
								</div>
								<h3 className="font-display font-semibold text-stone-800 text-lg mb-2">{f.title}</h3>
								<p className="text-stone-500 text-sm font-body leading-relaxed">{f.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{campaigns.length > 0 && (
				<section className="py-20 bg-stone-50">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex items-end justify-between mb-10">
							<div>
								<h2 className="section-title">Active Campaigns</h2>
								<p className="text-stone-500 font-body mt-2">Donation drives happening near you</p>
							</div>
							<Link to="/campaigns" className="btn-outline text-sm">
								View All →
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{campaigns.map((c, i) => (
								<motion.div key={c._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
									<Link to={`/campaigns/${c._id}`} className="card block hover:shadow-blood transition-all duration-300">
										<div className="h-32 bg-gradient-to-br from-blood-800 to-crimson flex items-center justify-center">
											<BloodDrop className="w-16 h-16 fill-white/20 animate-float" />
										</div>
										<div className="p-5">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-sans font-medium">Active</span>
											</div>
											<h3 className="font-display font-semibold text-stone-800 mb-1">{c.title}</h3>
											<p className="text-sm text-stone-500 font-sans">{c.organization?.orgName}</p>
											<div className="flex items-center gap-2 mt-3 text-xs text-stone-400 font-sans">
												<MapPin className="w-3 h-3" />
												<span>{c.city}</span>
											</div>
											<div className="mt-4 bg-stone-100 rounded-full h-1.5">
												<div className="bg-crimson h-1.5 rounded-full" style={{ width: `${Math.min(100, (c.collectedUnits / c.targetUnits) * 100)}%` }}></div>
											</div>
											<p className="text-xs text-stone-400 mt-1 font-sans">
												{c.collectedUnits}/{c.targetUnits} units
											</p>
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					</div>
				</section>
			)}

			<section className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="section-title">
							How It <span className="text-crimson italic">Works</span>
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
						<div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-blood-200 to-transparent"></div>
						{[
							{ step: "01", title: "Register as Donor", desc: "Sign up with your details including blood type and city. Takes less than 2 minutes.", icon: "🩸" },
							{ step: "02", title: "Get Matched", desc: "Receive alerts for campaigns and emergencies matching your blood type in your area.", icon: "📍" },
							{ step: "03", title: "Donate & Earn", desc: "Donate blood, earn points and badges. Track your impact and save lives.", icon: "🏆" },
						].map((s, i) => (
							<motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="text-center relative z-10">
								<div className="w-24 h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center text-4xl mb-5 border-2 border-blood-100">{s.icon}</div>
								<p className="text-sm font-sans font-semibold text-crimson mb-1">STEP {s.step}</p>
								<h3 className="font-display font-bold text-xl text-stone-800 mb-3">{s.title}</h3>
								<p className="text-stone-500 font-body leading-relaxed">{s.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="bg-gradient-to-br from-blood-900 via-crimson to-blood-700 py-20">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
						<div className="text-6xl mb-6">🩸</div>
						<h2 className="text-4xl font-display font-bold text-white mb-4">Ready to Save Lives?</h2>
						<p className="text-lg text-red-100 font-body mb-10">Join thousands of donors already making a difference. Your blood type could be the one someone needs today.</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Link to="/register/donor" className="bg-white text-crimson font-sans font-semibold px-8 py-3 rounded-lg hover:bg-red-50 transition-colors">
								Register as Donor
							</Link>
							<Link to="/register/organization" className="border-2 border-white/50 text-white font-sans font-semibold px-8 py-3 rounded-lg hover:border-white transition-colors">
								Register Organization
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
