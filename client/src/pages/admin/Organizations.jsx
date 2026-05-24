import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminOrganizations() {
	const [orgs, setOrgs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("pending");
	const [rejectModal, setRejectModal] = useState(null);
	const [rejectReason, setRejectReason] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const fetchOrgs = () => {
		setLoading(true);
		axios
			.get(`/api/admin/organizations?status=${statusFilter}&page=${page}&limit=10`)
			.then((r) => {
				setOrgs(r.data.orgs || []);
				setTotal(r.data.total || 0);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchOrgs();
	}, [statusFilter, page]);

	const updateStatus = async (id, status, reason) => {
		try {
			await axios.patch(`/api/admin/organizations/${id}/status`, { status, reason });
			toast.success(`Organization ${status}`);
			fetchOrgs();
			setRejectModal(null);
			setRejectReason("");
		} catch {
			toast.error("Action failed");
		}
	};

	const statusColor = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600", suspended: "bg-stone-100 text-stone-500" };
	const typeLabel = { hospital: "🏥", blood_bank: "🩸", clinic: "🏢", ngo: "🤝", other: "🏛️" };

	console.log(orgs);

	return (
		<div className="max-w-7xl mx-auto px-6 py-8">
			<h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Organization Management</h1>

			<div className="flex gap-2 mb-6">
				{["pending", "approved", "rejected", ""].map((s) => (
					<button
						key={s}
						onClick={() => {
							setStatusFilter(s);
							setPage(1);
						}}
						className={`px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors ${statusFilter === s ? "bg-crimson text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson"}`}
					>
						{s || "All"}
					</button>
				))}
			</div>

			<div className="card overflow-hidden">
				<table className="w-full">
					<thead className="bg-stone-50 border-b border-stone-100">
						<tr>
							{["Organization", "Type", "City", "Contact", "Status", "Registered", "Actions"].map((h) => (
								<th key={h} className="text-left text-xs font-sans font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-stone-50">
						{loading
							? [...Array(5)].map((_, i) => (
									<tr key={i}>
										<td colSpan={7} className="px-4 py-3">
											<div className="h-8 bg-stone-100 rounded animate-pulse"></div>
										</td>
									</tr>
							  ))
							: orgs.map((org) => (
									<tr key={org._id} className="hover:bg-stone-50 transition-colors">
										<td className="px-4 py-3">
											<p className="font-sans font-medium text-stone-700 text-sm">{org.orgName}</p>
											<p className="font-sans text-xs text-stone-400">{org.user?.email}</p>
										</td>
										<td className="px-4 py-3 text-sm font-sans text-stone-500">
											{typeLabel[org.orgType]} {org.orgType?.replace("_", " ")}
										</td>
										<td className="px-4 py-3 text-sm font-sans text-stone-500">{org.city}</td>
										<td className="px-4 py-3 text-sm font-sans text-stone-500">{org.user?.phone || "-"}</td>
										<td className="px-4 py-3">
											<span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${statusColor[org.status]}`}>{org.status}</span>
										</td>
										<td className="px-4 py-3 text-xs text-stone-400 font-sans">{org.user?.createdAt ? format(new Date(org.user.createdAt), "MMM d, yyyy") : "-"}</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1">
												{org.legalDocument && (
													<a href={org.legalDocument} target="_blank" rel="noopener noreferrer" className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Document">
														<FileText className="w-4 h-4" />
													</a>
												)}
												{org.status === "pending" && (
													<>
														<button onClick={() => updateStatus(org._id, "approved")} className="p-1.5 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
															<CheckCircle className="w-4 h-4" />
														</button>
														<button onClick={() => setRejectModal(org._id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
															<XCircle className="w-4 h-4" />
														</button>
													</>
												)}
												{org.status === "approved" && (
													<button onClick={() => updateStatus(org._id, "suspended")} className="text-xs px-2 py-1 text-orange-600 bg-orange-50 rounded-lg font-sans hover:bg-orange-100 transition-colors">
														Suspend
													</button>
												)}
												{org.status === "suspended" && (
													<button onClick={() => updateStatus(org._id, "approved")} className="text-xs px-2 py-1 text-green-600 bg-green-50 rounded-lg font-sans hover:bg-green-100 transition-colors">
														Restore
													</button>
												)}
											</div>
										</td>
									</tr>
							  ))}
					</tbody>
				</table>
				{orgs.length === 0 && !loading && <div className="text-center py-12 text-stone-400 font-sans">No organizations found</div>}
			</div>

			{/* Reject modal */}
			{rejectModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
						<h3 className="font-display font-bold text-stone-800 mb-4">Reject Organization</h3>
						<label className="label">Reason for rejection (optional)</label>
						<textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="input-field resize-none mb-4" placeholder="Provide a reason for the applicant..." />
						<div className="flex gap-3">
							<button
								onClick={() => {
									setRejectModal(null);
									setRejectReason("");
								}}
								className="btn-ghost border border-stone-200 flex-1"
							>
								Cancel
							</button>
							<button onClick={() => updateStatus(rejectModal, "rejected", rejectReason)} className="btn-primary flex-1">
								Confirm Rejection
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
