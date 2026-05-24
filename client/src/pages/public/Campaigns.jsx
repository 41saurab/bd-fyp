import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, Search, Filter } from 'lucide-react';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';
import { format } from 'date-fns';

const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['', 'upcoming', 'active', 'completed'];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'active', bloodType: '', city: '' });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...filters });
      const { data } = await axios.get(`/api/campaigns?${params}`);
      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, [page, filters]);

  const statusColor = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-stone-100 text-stone-500', cancelled: 'bg-red-100 text-red-600' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-stone-800 mb-2">Donation Campaigns</h1>
        <p className="text-stone-500 font-body">Find and register for blood donation drives near you</p>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="label">Search City</label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="input-field pl-9" placeholder="Enter city..." value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Blood Type</label>
            <select className="input-field" value={filters.bloodType} onChange={e => setFilters(f => ({ ...f, bloodType: e.target.value }))}>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt === 'All' ? '' : bt}>{bt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 font-sans">{total} campaigns found</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-32 bg-stone-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🩸</div>
          <p className="text-stone-500 font-body text-lg">No campaigns found with these filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <Link key={c._id} to={`/campaigns/${c._id}`} className="card block hover:shadow-blood transition-all duration-300 group">
              <div className="h-36 bg-gradient-to-br from-blood-800 to-crimson relative overflow-hidden flex items-center justify-center">
                {c.image ? (
                  <img src={`/${c.image}`} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-16 h-16 fill-white/20 group-hover:fill-white/30 transition-colors animate-float"><path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/></svg>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium ${statusColor[c.status]}`}>{c.status}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1 mb-3">
                  {(c.targetBloodTypes || []).slice(0, 4).map(bt => <BloodTypeBadge key={bt} type={bt} />)}
                  {(c.targetBloodTypes || []).length > 4 && <span className="text-xs text-stone-400 font-sans">+{c.targetBloodTypes.length - 4}</span>}
                </div>
                <h3 className="font-display font-semibold text-stone-800 mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-sm text-stone-500 font-sans">{c.organization?.orgName}</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{c.venue}, {c.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(c.startDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.registeredDonors?.length || 0} registered</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-stone-400 font-sans mb-1">
                    <span>{c.collectedUnits} collected</span>
                    <span>{c.targetUnits} target</span>
                  </div>
                  <div className="bg-stone-100 rounded-full h-1.5">
                    <div className="bg-crimson h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (c.collectedUnits / c.targetUnits) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(Math.ceil(total / 12))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-sans transition-colors ${page === i + 1 ? 'bg-crimson text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-crimson hover:text-crimson'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
