import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, MapPin, Users, Droplet, CheckCircle2, Clock, Pencil, Ban, Trash2, Zap, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import BloodTypeBadge from "../../components/common/BloodTypeBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";

const statusColor = {
  active: "bg-green-100 text-green-700",
  fulfilled: "bg-stone-100 text-stone-500",
  expired: "bg-red-100 text-red-600",
  cancelled: "bg-red-100 text-red-600",
};

const respondentStatusStyle = {
  interested: "bg-amber-50 text-amber-700 border-amber-200",
  donated: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-stone-50 text-stone-500 border-stone-200",
};

export default function OrgEmergencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    axios
      .get(`/api/emergency/${id}`)
      .then((r) => setRequest(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleMarkDonated = async (donorId) => {
    setMarkingId(donorId);
    try {
      const res = await axios.patch(`/api/emergency/${id}/donors/${donorId}/donate`);
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

  const handleFulfill = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`/api/emergency/${id}/fulfill`);
      toast.success("Request marked as fulfilled.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update this request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`/api/emergency/${id}/cancel`);
      toast.success("Request cancelled.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel this request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/emergency/${id}`);
      toast.success("Request deleted.");
      navigate("/organization/emergency");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete this request.");
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
  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-stone-500 font-body">Emergency request not found.</p>
        <Link to="/organization/emergency" className="text-crimson font-sans font-medium mt-2 inline-block">
          Back to emergency requests
        </Link>
      </div>
    );
  }

  const respondents = request.respondents || [];
  const progress = request.unitsNeeded ? Math.min(100, ((request.unitsReceived || 0) / request.unitsNeeded) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/organization/emergency" className="flex items-center gap-1.5 text-sm font-sans text-stone-500 hover:text-crimson">
          <ArrowLeft className="w-4 h-4" /> Back to Emergency Requests
        </Link>
        {request.status === "active" && (
          <div className="flex items-center gap-2">
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" disabled={actionLoading} className="text-green-600 border-green-200 hover:bg-green-50">
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Fulfilled
                </Button>
              }
              title="Mark this request as fulfilled?"
              description={'Use this if the need was met outside the app. It won\u2019t award points to any donor — use "Mark as Donated" below for that.'}
              confirmLabel="Mark Fulfilled"
              loading={actionLoading}
              onConfirm={handleFulfill}
            />
            <Button asChild variant="outline" size="sm">
              <Link to={`/organization/emergency/${id}/edit`}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="amber" size="sm" disabled={actionLoading}>
                  <Ban className="w-3.5 h-3.5" /> Cancel
                </Button>
              }
              title="Cancel this emergency request?"
              description="Donors who responded will be notified."
              confirmLabel="Cancel Request"
              variant="destructive"
              loading={actionLoading}
              onConfirm={handleCancel}
            />
            {respondents.length === 0 && (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" size="sm" disabled={actionLoading}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                }
                title="Permanently delete this request?"
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
            <h1 className="text-2xl font-display font-bold text-stone-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-crimson" /> {request.patientName}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-stone-400 font-sans mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {request.location}, {request.city}
              </span>
              {request.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Needed by {format(new Date(request.deadline), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium flex-shrink-0 ${statusColor[request.status] || statusColor.active}`}>{request.status}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <BloodTypeBadge type={request.bloodType} size="lg" />
          <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-bold uppercase ${request.urgencyLevel === "critical" ? "bg-red-600 text-white" : "bg-orange-500 text-white"}`}>{request.urgencyLevel}</span>
          <span className="text-xs px-2.5 py-1 rounded-full font-sans font-medium bg-stone-100 text-stone-500">{request.pointsReward || 15} pts per donation</span>
        </div>

        <p className="text-sm text-stone-600 font-sans mb-4">{request.reason}</p>

        <div className="flex justify-between mb-2">
          <span className="text-sm font-sans text-stone-500">{request.unitsReceived || 0} units received</span>
          <span className="text-sm font-sans text-stone-500">{request.unitsNeeded} needed</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-crimson to-blood-400 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-crimson" /> Responding Donors ({respondents.length})
        </h2>

        {respondents.length === 0 ? (
          <p className="text-stone-400 font-sans text-sm py-8 text-center">No donors have responded yet.</p>
        ) : (
          <div className="space-y-3">
            {respondents.map((r) => {
              const donor = r.donor;
              if (!donor || typeof donor !== "object") return null;
              const isDonated = r.status === "donated";
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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium border flex-shrink-0 ${respondentStatusStyle[r.status] || respondentStatusStyle.interested} flex items-center gap-1`}>
                    {isDonated ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {r.status}
                  </span>
                  {!isDonated && r.status === "interested" && request.status === "active" && (
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
