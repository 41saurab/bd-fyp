import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, Users, Clock, Award, Phone } from 'lucide-react';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';
import { format } from 'date-fns';

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    axios.get(`/api/campaigns/${id}`).then(r => setCampaign(r.data)).catch(() => navigate('/campaigns')).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'donor') return toast.error('Only donors can register for campaigns');
    setRegistering(true);
    try {
      await axios.post(`/api/campaigns/${id}/register`);
      toast.success('Successfully registered for campaign!');
      setCampaign(c => ({ ...c, registeredDonors: [...(c.registeredDonors || []), { donor: user._id }] }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegistering(false); }
  };

  const isRegistered = campaign?.registeredDonors?.some(r => r.donor?._id === user?._id || r.donor === user?._id);
  const progress = campaign ? Math.min(100, (campaign.collectedUnits / campaign.targetUnits) * 100) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-crimson border-t-transparent rounded-full"></div></div>;
  if (!campaign) return null;

  const statusColor = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-stone-100 text-stone-500' };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-blood-800 to-crimson relative flex items-center justify-center">
              {campaign.image ? <img src={`/${campaign.image}`} alt="" className="w-full h-full object-cover" /> :
                <svg viewBox="0 0 24 24" className="w-24 h-24 fill-white/20"><path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/></svg>}
              <div className="absolute top-4 left-4">
                <span className={`text-sm px-3 py-1 rounded-full font-sans font-medium ${statusColor[campaign.status] || statusColor.active}`}>{campaign.status}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {campaign.targetBloodTypes?.map(bt => <BloodTypeBadge key={bt} type={bt} />)}
              </div>
              <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">{campaign.title}</h1>
              <p className="text-stone-500 font-body leading-relaxed">{campaign.description}</p>
            </div>
          </div>

          {campaign.requirements && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-stone-800 mb-3">Requirements</h3>
              <p className="text-stone-500 font-body">{campaign.requirements}</p>
            </div>
          )}

          {/* Registered donors count */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-stone-800 mb-4">Campaign Progress</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-sans text-stone-500">{campaign.collectedUnits} units collected</span>
              <span className="text-sm font-sans text-stone-500">{campaign.targetUnits} target</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-crimson to-blood-400 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-stone-400 mt-2 font-sans">{Math.round(progress)}% of target reached</p>
            <div className="flex items-center gap-2 mt-4 text-stone-500">
              <Users className="w-4 h-4 text-crimson" />
              <span className="text-sm font-sans">{campaign.registeredDonors?.length || 0} donors registered</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Register CTA */}
          {['upcoming', 'active'].includes(campaign.status) && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-crimson" />
                <p className="font-sans font-semibold text-stone-700">+{campaign.pointsReward} Points</p>
              </div>
              {isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-sans font-semibold text-sm">✓ You're Registered!</p>
                  <p className="text-green-600 text-xs mt-1 font-sans">See you there</p>
                </div>
              ) : (
                <button onClick={handleRegister} disabled={registering} className="btn-primary w-full py-3">
                  {registering ? 'Registering...' : 'Register to Donate'}
                </button>
              )}
              {!user && <p className="text-xs text-stone-400 text-center mt-2 font-sans">Login required to register</p>}
            </div>
          )}

          {/* Details */}
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-semibold text-stone-800">Details</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-sans font-medium text-stone-700">{campaign.venue}</p>
                <p className="text-xs text-stone-400 font-sans">{campaign.address}, {campaign.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-sans font-medium text-stone-700">Start: {format(new Date(campaign.startDate), 'MMM d, yyyy')}</p>
                <p className="text-xs text-stone-400 font-sans">End: {format(new Date(campaign.endDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
            {campaign.contactInfo && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
                <p className="text-sm font-sans text-stone-600">{campaign.contactInfo}</p>
              </div>
            )}
          </div>

          {/* Organization */}
          {campaign.organization && (
            <div className="card p-5">
              <p className="text-xs text-stone-400 font-sans uppercase tracking-wide mb-2">Organized by</p>
              <p className="font-display font-semibold text-stone-800">{campaign.organization.orgName}</p>
              <p className="text-xs text-stone-400 font-sans capitalize mt-1">{campaign.organization.orgType?.replace('_', ' ')} · {campaign.organization.city}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
