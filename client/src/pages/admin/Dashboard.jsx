import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Users, Building2, Calendar, Zap, TrendingUp, Clock, Droplets } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = ["#c0392b", "#e74c3c", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#e67e22", "#d35400"];

export default function AdminDashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		axios
			.get("/api/admin/stats")
			.then((r) => setStats(r.data))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div>
			</div>
		);

	const pieData = (stats?.bloodTypeStats || []).map((b) => ({ name: b._id, value: b.count }));

	const statCards = [
		{ icon: Users, label: "Total Donors", value: stats?.totalDonors, color: "text-crimson", bg: "bg-red-50", link: "/admin/donors" },
		{ icon: Building2, label: "Active Orgs", value: stats?.totalOrgs, color: "text-blue-600", bg: "bg-blue-50", link: "/admin/organizations" },
		{ icon: Clock, label: "Pending Approval", value: stats?.pendingOrgs, color: "text-orange-600", bg: "bg-orange-50", link: "/admin/organizations?status=pending" },
		{ icon: Calendar, label: "Total Campaigns", value: stats?.totalCampaigns, color: "text-green-600", bg: "bg-green-50", link: "/admin/campaigns" },
		{ icon: Zap, label: "Active Campaigns", value: stats?.activeCampaigns, color: "text-purple-600", bg: "bg-purple-50", link: "/admin/campaigns" },
		{ icon: Zap, label: "Active Emergencies", value: stats?.emergencyRequests, color: "text-red-600", bg: "bg-red-50", link: "/admin/emergency" },
		{ icon: TrendingUp, label: "New Donors (30d)", value: stats?.recentDonors, color: "text-teal-600", bg: "bg-teal-50", link: "/admin/donors" },
		{ icon: Building2, label: "New Orgs (30d)", value: stats?.recentOrgs, color: "text-indigo-600", bg: "bg-indigo-50", link: "/admin/organizations" },
	];

	return (
		<div className="max-w-7xl mx-auto px-6 py-8">
			<div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-7 mb-8 text-white">
				<p className="text-stone-400 text-sm font-sans mb-1">Admin Control Panel</p>
				<h1 className="text-3xl font-display font-bold">Raktabindu Dashboard</h1>
				<p className="text-stone-400 font-sans text-sm mt-2">Platform overview and management</p>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				{statCards.map((s) => (
					<Link key={s.label} to={s.link} className="card p-5 hover:shadow-md transition-all">
						<div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
							<s.icon className={`w-5 h-5 ${s.color}`} />
						</div>
						<p className="text-2xl font-display font-bold text-stone-800">{s.value ?? 0}</p>
						<p className="text-xs text-stone-400 font-sans mt-0.5">{s.label}</p>
					</Link>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Blood type distribution */}
				<div className="card p-6">
					<h3 className="font-display font-semibold text-stone-800 mb-5">Blood Type Distribution</h3>
					{pieData.length > 0 ? (
						<ResponsiveContainer width="100%" height={228}>
							<PieChart>
								<Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
									{pieData.map((_, i) => (
										<Cell key={i} fill={COLORS[i % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="flex items-center justify-center h-44 text-stone-400 font-sans text-sm">No donor data yet</div>
					)}
				</div>

				{/* Quick actions */}
				<div className="card p-6">
					<h3 className="font-display font-semibold text-stone-800 mb-5">Quick Actions</h3>
					<div className="space-y-3">
						{[
							{ to: "/admin/organizations?status=pending", label: `Review Pending Organizations (${stats?.pendingOrgs || 0})`, color: "text-orange-700 bg-orange-50 border-orange-200", icon: "⏳" },
							{ to: "/admin/emergency", label: `Active Emergencies (${stats?.emergencyRequests || 0})`, color: "text-red-700 bg-red-50 border-red-200", icon: "🚨" },
							{ to: "/admin/broadcast", label: "Send Broadcast to All Donors", color: "text-blue-700 bg-blue-50 border-blue-200", icon: "📢" },
							{ to: "/admin/donors", label: "Manage Donors", color: "text-stone-700 bg-stone-50 border-stone-200", icon: "👥" },
						].map((a) => (
							<Link key={a.to} to={a.to} className={`flex items-center gap-3 p-3 rounded-xl border font-sans text-sm font-medium hover:opacity-80 transition-opacity ${a.color}`}>
								<span className="text-lg">{a.icon}</span>
								{a.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
