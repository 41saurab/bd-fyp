import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Droplets, Award, Clock, TrendingUp, Calendar, Zap, CheckCircle } from 'lucide-react';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';
import { formatDistanceToNow } from 'date-fns';

const BADGE_ICONS = { 'First Drop': '🩸', 'Life Saver': '💪', 'Hero': '🦸', 'Champion': '🏆', 'Legend': '⭐' };

export default function DonorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    axios.get('/api/donors/stats').then(r => setStats(r.data)).catch(() => {});
    axios.get('/api/campaigns?status=active&limit=3').then(r => setCampaigns(r.data.campaigns || [])).catch(() => {});
    axios.get('/api/emergency?status=active').then(r => setEmergencies((r.data || []).slice(0, 3))).catch(() => {});
  }, []);

  const nextBadge = () => {
    const count = stats?.totalDonations || 0;
    if (count < 1) return { name: 'First Drop', required: 1, icon: '🩸' };
    if (count < 5) return { name: 'Life Saver', required: 5, icon: '💪' };
    if (count < 10) return { name: 'Hero', required: 10, icon: '🦸' };
    if (count < 25) return { name: 'Champion', required: 25, icon: '🏆' };
    if (count < 50) return { name: 'Legend', required: 50, icon: '⭐' };
    return null;
  };

  const next = nextBadge();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blood-800 to-crimson rounded-2xl p-7 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-200 text-sm font-sans mb-1">Welcome back,</p>
            <h1 className="text-3xl font-display font-bold">{user?.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              {profile?.bloodType && <BloodTypeBadge type={profile.bloodType} size="lg" />}
              {stats?.isEligible ? (
                <span className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-sans px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Eligible to Donate
                </span>
              ) : (
                <span className="bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-sans px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {stats?.daysUntilEligible} days until eligible
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-red-200 text-sm font-sans">Total Points</p>
            <p className="text-5xl font-display font-bold">{stats?.points || 0}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Droplets, label: 'Total Donations', value: stats?.totalDonations || 0, color: 'text-crimson' },
          { icon: TrendingUp, label: 'Points Earned', value: stats?.points || 0, color: 'text-green-600' },
          { icon: Award, label: 'Badges', value: (stats?.badges || []).length, color: 'text-yellow-600' },
          { icon: Clock, label: 'Days Until Eligible', value: stats?.daysUntilEligible ?? 0, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
            <p className="text-2xl font-display font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400 font-sans mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next badge */}
        {next && (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-stone-800 mb-4">Next Achievement</h3>
            <div className="text-center">
              <div className="text-5xl mb-3">{next.icon}</div>
              <p className="font-display font-bold text-stone-800">{next.name}</p>
              <p className="text-sm text-stone-500 font-sans mt-1">{next.required - (stats?.totalDonations || 0)} more donations needed</p>
              <div className="mt-4 h-2 bg-stone-100 rounded-full">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${((stats?.totalDonations || 0) / next.required) * 100}%` }}></div>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-1">{stats?.totalDonations || 0}/{next.required}</p>
            </div>
            <Link to="/donor/badges" className="btn-outline w-full text-center text-sm mt-4 block">View All Badges</Link>
          </div>
        )}

        {/* Earned Badges */}
        {(stats?.badges || []).length > 0 && (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-stone-800 mb-4">Your Badges</h3>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map(b => (
                <div key={b} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                  <span className="text-xl">{BADGE_ICONS[b] || '🏅'}</span>
                  <span className="text-xs font-sans font-medium text-yellow-700">{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby emergencies */}
        {emergencies.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-stone-800">Active Emergencies</h3>
              <Link to="/emergency" className="text-xs text-crimson font-sans hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {emergencies.map(em => (
                <Link key={em._id} to={`/emergency/${em._id}`} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                  <div className="w-10 h-10 bg-crimson rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold font-sans">{em.bloodType}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-sans font-medium text-stone-700 truncate">{em.organization?.orgName}</p>
                    <p className="text-xs text-stone-400 font-sans">{em.city} · {em.unitsNeeded} units</p>
                  </div>
                  <Zap className="w-4 h-4 text-crimson flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nearby Campaigns */}
      {campaigns.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-stone-800 text-xl">Active Campaigns Near You</h3>
            <Link to="/campaigns" className="text-sm text-crimson font-sans hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <Link key={c._id} to={`/campaigns/${c._id}`} className="card p-5 hover:shadow-blood transition-all">
                <div className="flex flex-wrap gap-1 mb-2">
                  {c.targetBloodTypes?.slice(0, 3).map(bt => <BloodTypeBadge key={bt} type={bt} />)}
                </div>
                <h4 className="font-display font-semibold text-stone-800 mb-1">{c.title}</h4>
                <p className="text-xs text-stone-400 font-sans">{c.organization?.orgName} · {c.city}</p>
                <div className="mt-3 h-1.5 bg-stone-100 rounded-full">
                  <div className="h-full bg-crimson rounded-full" style={{ width: `${Math.min(100, (c.collectedUnits / c.targetUnits) * 100)}%` }}></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[
          { to: '/donor/profile', icon: '👤', label: 'My Profile' },
          { to: '/donor/donations', icon: '🩸', label: 'Donation History' },
          { to: '/donor/badges', icon: '🏆', label: 'My Badges' },
          { to: '/donor/notifications', icon: '🔔', label: 'Notifications' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card p-4 text-center hover:shadow-blood transition-all hover:-translate-y-0.5">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-sm font-sans font-medium text-stone-600">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
